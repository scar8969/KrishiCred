"""Fire detection service using satellite data."""
import logging
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID

# Make Google Earth Engine optional
try:
    import ee
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False
    ee = None

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.exceptions import SatelliteProcessingException, ValidationException
from app.core.logging import get_logger
from app.models.fire_alert import FireAlert, AlertSource, AlertStatus
from app.models.farmer import Farmer
from app.schemas.fire_alert import FireAlertCreate

settings = get_settings()
logger = get_logger(__name__)


class FireDetector:
    """
    Service for detecting fires from satellite imagery.

    Integrates with Google Earth Engine to process MODIS/VIIRS data
    and identify crop residue burning events.
    """

    def __init__(self, db: AsyncSession):
        """Initialize fire detector with database session."""
        self.db = db
        self._init_earth_engine()

    def _init_earth_engine(self) -> None:
        """Initialize Google Earth Engine connection."""
        if not EE_AVAILABLE:
            logger.warning("Google Earth Engine not available - running in mock mode")
            return

        try:
            # Initialize Earth Engine with service account
            ee.Initialize(
                email=settings.GEE_PROJECT_ID,
                private_key=open(settings.GEE_SERVICE_ACCOUNT_KEY_PATH).read(),
            )
            logger.info("Google Earth Engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Earth Engine: {e}")
            # For development, allow initialization without EE
            if settings.DEBUG:
                logger.warning("Running without Earth Engine (DEBUG mode)")

    async def process_modis_data(
        self,
        start_time: datetime,
        end_time: datetime,
    ) -> list[dict[str, Any]]:
        """
        Process MODIS satellite data for fire detection.

        Args:
            start_time: Start of time range
            end_time: End of time range

        Returns:
            List of detected fires with metadata
        """
        bbox = settings.PUNJAB_BOUNDING_BOX

        try:
            # Get MODIS collection
            collection = (
                ee.ImageCollection(settings.MODIS_COLLECTION)
                .filterDate(start_time, end_time)
                .filterBounds(
                    ee.Geometry.Rectangle([
                        bbox["min_lon"],
                        bbox["min_lat"],
                        bbox["max_lon"],
                        bbox["max_lat"],
                    ])
                )
                .filter(ee.Filter.rangeContains(
                    "confidence",
                    settings.FIRE_CONFIDENCE_THRESHOLD,
                    100
                ))
            )

            # Extract fire points
            fires = []
            fire_list = collection.toList(collection.size())

            for i in range(collection.size().getInfo()):
                try:
                    fire_image = ee.Image(fire_list.get(i))
                    fire_dict = fire_image.toDictionary().getInfo()

                    # Get geometry (centroid of fire pixel)
                    geometry = fire_image.geometry().centroid().getInfo()
                    coordinates = geometry.get("coordinates", [0, 0])

                    fire_data = {
                        "satellite_id": fire_dict.get("system:index", ""),
                        "source": AlertSource.MODIS,
                        "detection_time": datetime.fromtimestamp(
                            fire_dict.get("system:time_start", 0) / 1000
                        ),
                        "latitude": coordinates[1],
                        "longitude": coordinates[0],
                        "confidence": fire_dict.get("confidence", 0),
                        "brightness": fire_dict.get("brightness", None),
                        "power": fire_dict.get("frp", None),
                        "pixel_size_km": 1.0,
                        "scan": fire_dict.get("scan", None),
                        "track": fire_dict.get("track", None),
                    }

                    fires.append(fire_data)

                except Exception as e:
                    logger.error(f"Error processing MODIS fire {i}: {e}")
                    continue

            logger.info(f"MODIS: Found {len(fires)} fire detections")
            return fires

        except Exception as e:
            logger.error(f"MODIS processing failed: {e}")
            raise SatelliteProcessingException(f"MODIS processing failed: {str(e)}")

    async def process_viirs_data(
        self,
        start_time: datetime,
        end_time: datetime,
    ) -> list[dict[str, Any]]:
        """
        Process VIIRS satellite data for fire detection.

        VIIRS provides higher resolution fire detection than MODIS.
        """
        bbox = settings.PUNJAB_BOUNDING_BOX

        try:
            collection = (
                ee.ImageCollection(settings.VIIRS_COLLECTION)
                .filterDate(start_time, end_time)
                .filterBounds(
                    ee.Geometry.Rectangle([
                        bbox["min_lon"],
                        bbox["min_lat"],
                        bbox["max_lon"],
                        bbox["max_lat"],
                    ])
                )
                .filter(ee.Filter.rangeContains(
                    "confidence",
                    settings.FIRE_CONFIDENCE_THRESHOLD,
                    100
                ))
            )

            fires = []
            fire_list = collection.toList(collection.size())

            for i in range(collection.size().getInfo()):
                try:
                    fire_image = ee.Image(fire_list.get(i))
                    fire_dict = fire_image.toDictionary().getInfo()
                    geometry = fire_image.geometry().centroid().getInfo()
                    coordinates = geometry.get("coordinates", [0, 0])

                    fire_data = {
                        "satellite_id": fire_dict.get("system:index", ""),
                        "source": AlertSource.VIIRS,
                        "detection_time": datetime.fromtimestamp(
                            fire_dict.get("system:time_start", 0) / 1000
                        ),
                        "latitude": coordinates[1],
                        "longitude": coordinates[0],
                        "confidence": fire_dict.get("confidence", 0),
                        "brightness": fire_dict.get("brightness", None),
                        "power": fire_dict.get("frp", None),
                        "pixel_size_km": 0.375,  # VIIRS has better resolution
                    }

                    fires.append(fire_data)

                except Exception as e:
                    logger.error(f"Error processing VIIRS fire {i}: {e}")
                    continue

            logger.info(f"VIIRS: Found {len(fires)} fire detections")
            return fires

        except Exception as e:
            logger.error(f"VIIRS processing failed: {e}")
            raise SatelliteProcessingException(f"VIIRS processing failed: {str(e)}")

    async def create_alert(self, alert_data: FireAlertCreate) -> FireAlert:
        """
        Create a new fire alert from detection data.

        Args:
            alert_data: Fire detection data from satellite

        Returns:
            Created FireAlert instance
        """
        from app.models.fire_alert import FireAlert

        alert = FireAlert(**alert_data.model_dump())
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)

        logger.info(f"Created fire alert {alert.id} from {alert_data.source}")
        return alert

    async def create_alert_from_satellite(self, fire_data: dict[str, Any]) -> FireAlert:
        """Create alert from raw satellite data."""
        alert_data = FireAlertCreate(
            satellite_id=fire_data["satellite_id"],
            source=fire_data["source"],
            detection_time=fire_data["detection_time"],
            latitude=fire_data["latitude"],
            longitude=fire_data["longitude"],
            confidence=fire_data["confidence"],
            brightness=fire_data.get("brightness"),
            power=fire_data.get("power"),
            pixel_size_km=fire_data.get("pixel_size_km", 1.0),
            scan=fire_data.get("scan"),
            track=fire_data.get("track"),
            metadata=fire_data,
        )

        return await self.create_alert(alert_data)

    async def find_existing_alert(
        self,
        satellite_id: str,
        detection_time: datetime,
        tolerance_minutes: int = 30,
    ) -> Optional[FireAlert]:
        """
        Check if alert already exists for this detection.

        Prevents duplicate alerts from overlapping satellite passes.
        """
        cutoff = detection_time - timedelta(minutes=tolerance_minutes)

        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.satellite_id == satellite_id)
            .where(FireAlert.detection_time >= cutoff)
        )

        return result.scalar_one_or_none()

    async def match_nearby_farmers(
        self,
        alert: FireAlert,
        radius_km: Optional[int] = None,
    ) -> int:
        """
        Match fire alert with nearby farmers.

        Uses PostGIS to find farmers within alert radius.

        Args:
            alert: Fire alert to match
            radius_km: Search radius (defaults to config)

        Returns:
            Number of farmers matched
        """
        from app.utils.geo import find_nearby_farmers

        if radius_km is None:
            radius_km = settings.FIRE_DETECTION_RADIUS_KM

        farmers = await find_nearby_farmers(
            self.db,
            latitude=alert.latitude,
            longitude=alert.longitude,
            radius_km=radius_km,
        )

        if farmers:
            # Link closest farmer to alert
            alert.farmer_id = farmers[0].id
            await self.db.commit()

            logger.info(
                f"Matched alert {alert.id} with {len(farmers)} farmers, "
                f"closest: {farmers[0].name}"
            )

        return len(farmers)

    async def get_active_fires(
        self,
        hours_back: int = 24,
    ) -> list[FireAlert]:
        """Get all active (unresolved) fire alerts from recent hours."""
        cutoff = datetime.utcnow() - timedelta(hours=hours_back)

        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.detection_time >= cutoff)
            .where(FireAlert.status.in_([
                AlertStatus.DETECTED,
                AlertStatus.ALERTING,
            ]))
            .order_by(FireAlert.detection_time.desc())
        )

        return list(result.scalars().all())

    async def get_fires_by_region(
        self,
        min_lat: float,
        max_lat: float,
        min_lon: float,
        max_lon: float,
        hours_back: int = 24,
    ) -> list[FireAlert]:
        """Get fires within a geographic bounding box."""
        cutoff = datetime.utcnow() - timedelta(hours=hours_back)

        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.detection_time >= cutoff)
            .where(FireAlert.latitude >= min_lat)
            .where(FireAlert.latitude <= max_lat)
            .where(FireAlert.longitude >= min_lon)
            .where(FireAlert.longitude <= max_lon)
            .order_by(FireAlert.detection_time.desc())
        )

        return list(result.scalars().all())
