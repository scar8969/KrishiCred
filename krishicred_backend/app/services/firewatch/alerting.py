"""Alert management service for farmer notifications."""
import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.models.fire_alert import FireAlert, AlertStatus
from app.models.farmer import Farmer
from app.utils.whatsapp import WhatsAppClient
from app.utils.i18n import Translator

settings = get_settings()
logger = get_logger(__name__)


class AlertManager:
    """
    Service for managing fire alerts and sending notifications.

    Handles WhatsApp message delivery to farmers in their preferred language.
    """

    def __init__(self, db: AsyncSession):
        """Initialize alert manager with database session."""
        self.db = db
        self.whatsapp = WhatsAppClient()
        self.translator = Translator()

    async def send_alerts(self, alert_id: UUID) -> Optional[FireAlert]:
        """
        Send WhatsApp alerts to farmers for a fire detection.

        Args:
            alert_id: UUID of the fire alert

        Returns:
            Updated FireAlert with alert status
        """
        # Get alert with farmer relation
        result = await self.db.execute(
            select(FireAlert)
            .options(selectinload(FireAlert.farmer))
            .where(FireAlert.id == alert_id)
        )
        alert = result.scalar_one_or_none()

        if not alert:
            logger.error(f"Alert {alert_id} not found")
            return None

        if alert.alert_sent:
            logger.info(f"Alerts already sent for {alert_id}")
            return alert

        # Get nearby farmers
        from app.utils.geo import find_nearby_farmers

        farmers = await find_nearby_farmers(
            self.db,
            latitude=alert.latitude,
            longitude=alert.longitude,
            radius_km=settings.FIRE_DETECTION_RADIUS_KM,
        )

        if not farmers:
            logger.warning(f"No farmers found near alert {alert_id}")
            return alert

        farmers_alerted = 0

        for farmer in farmers:
            if not farmer.whatsapp_opt_in:
                continue

            try:
                # Send message in farmer's preferred language
                await self._send_fire_alert(farmer, alert)
                farmers_alerted += 1

                logger.info(f"Alert sent to farmer {farmer.id} ({farmer.name})")

            except Exception as e:
                logger.error(f"Failed to alert farmer {farmer.id}: {e}")
                continue

        # Update alert
        alert.mark_alert_sent(farmers_alerted)
        await self.db.commit()
        await self.db.refresh(alert)

        logger.info(f"Alert {alert_id} sent to {farmers_alerted} farmers")
        return alert

    async def _send_fire_alert(self, farmer: Farmer, alert: FireAlert) -> None:
        """Send fire alert message to a farmer."""
        # Get message in farmer's language
        message = self._get_alert_message(farmer, alert)

        await self.whatsapp.send_message(
            phone_number=farmer.phone,
            message=message,
            template_name=settings.WHATSAPP_TEMPLATE_NAMESPACE,
        )

    def _get_alert_message(self, farmer: Farmer, alert: FireAlert) -> str:
        """Generate alert message in farmer's preferred language."""
        location_name = farmer.village or "your area"

        if farmer.language.value == "pa":  # Punjabi
            return self.translator.translate(
                "fire_alert_punjabi",
                {
                    "farmer_name": farmer.name,
                    "location": location_name,
                    "time": alert.detection_time.strftime("%I:%M %p"),
                    "date": alert.detection_time.strftime("%Y-%m-%d"),
                },
            )
        elif farmer.language.value == "hi":  # Hindi
            return self.translator.translate(
                "fire_alert_hindi",
                {
                    "farmer_name": farmer.name,
                    "location": location_name,
                    "time": alert.detection_time.strftime("%I:%M %p"),
                    "date": alert.detection_time.strftime("%Y-%m-%d"),
                },
            )
        else:  # English (default)
            return (
                f"🔥 FIRE ALERT - KrishiCred\n\n"
                f"Dear {farmer.name},\n\n"
                f"A fire has been detected near {location_name} "
                f"at {alert.detection_time.strftime('%I:%M %p')} on "
                f"{alert.detection_time.strftime('%B %d, %Y')}.\n\n"
                f"⚠️ Please DO NOT burn crop residue.\n\n"
                f"💰 Instead, sell your stubble to earn money!\n"
                f"Reply 'SELL' to connect with nearby biogas plants.\n\n"
                f"Reply 'SAFE' if this is not your farm.\n\n"
                f"KrishiCred - Saving farms, earning credits."
            )

    async def record_response(
        self,
        alert_id: UUID,
        farmer_id: UUID,
        response_type: str,
        notes: Optional[str] = None,
    ) -> Optional[FireAlert]:
        """
        Record farmer's response to fire alert.

        Args:
            alert_id: UUID of the fire alert
            farmer_id: UUID of the responding farmer
            response_type: Type of response (will_not_burn, already_burned, false_alarm)
            notes: Optional additional notes

        Returns:
            Updated FireAlert
        """
        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.id == alert_id)
        )
        alert = result.scalar_one_or_none()

        if not alert:
            logger.error(f"Alert {alert_id} not found")
            return None

        # Handle response types
        if response_type == "will_not_burn":
            # Farmer committed to not burning - resolve alert
            alert.mark_resolved()
            logger.info(f"Alert {alert_id} resolved - farmer will not burn")

        elif response_type == "already_burned":
            # Too late - record but don't resolve
            alert.response_received = True
            alert.response_at = datetime.utcnow()
            logger.info(f"Alert {alert_id} - already burned")

        elif response_type == "false_alarm":
            # Not this farmer's farm
            alert.mark_false_positive()
            logger.info(f"Alert {alert_id} marked as false positive")

        else:
            raise ValidationException(f"Invalid response type: {response_type}")

        # Store notes
        if notes:
            alert.metadata["response_notes"] = notes

        await self.db.commit()
        await self.db.refresh(alert)

        return alert

    async def send_collection_offer(self, farmer_id: UUID, alert_id: UUID) -> bool:
        """
        Send stubble collection offer to farmer.

        When a farmer responds positively to fire alert, send
        information about stubble collection options.
        """
        result = await self.db.execute(
            select(Farmer).where(Farmer.id == farmer_id)
        )
        farmer = result.scalar_one_or_none()

        if not farmer:
            logger.error(f"Farmer {farmer_id} not found")
            return False

        # Find nearby plants
        from app.utils.geo import find_nearby_biogas_plants
        plants = await find_nearby_biogas_plants(
            self.db,
            latitude=farmer.latitude,
            longitude=farmer.longitude,
            radius_km=settings.MAX_COLLECTION_DISTANCE_KM,
        )

        if not plants:
            message = self.translator.translate(
                "no_plants_nearby",
                {"farmer_name": farmer.name},
                language=farmer.language.value,
            )
        else:
            plant_info = "\n".join([
                f"• {p.name} - {p.price_per_ton} INR/ton"
                for p in plants[:3]  # Show top 3
            ])

            message = (
                f"🌾 STUBBLE COLLECTION AVAILABLE\n\n"
                f"Dear {farmer.name},\n\n"
                f"Thank you for not burning! Nearby biogas plants:\n\n"
                f"{plant_info}\n\n"
                f"Reply 'COLLECT' to schedule pickup.\n\n"
                f"KrishiCred - Converting stubble to credit."
            )

        await self.whatsapp.send_message(
            phone_number=farmer.phone,
            message=message,
        )

        return True

    async def get_alerts_summary(self, hours: int = 24) -> dict:
        """Get summary of recent alerts."""
        from datetime import timedelta

        cutoff = datetime.utcnow() - timedelta(hours=hours)

        result = await self.db.execute(
            select(FireAlert)
            .where(FireAlert.detection_time >= cutoff)
        )
        alerts = list(result.scalars().all())

        return {
            "period_hours": hours,
            "total_alerts": len(alerts),
            "alerts_sent": sum(1 for a in alerts if a.alert_sent),
            "farmers_alerted": sum(a.farmers_alerted for a in alerts),
            "resolved_alerts": sum(1 for a in alerts if a.status == AlertStatus.RESOLVED),
            "high_confidence": sum(1 for a in alerts if a.high_confidence),
            "by_source": {
                "MODIS": sum(1 for a in alerts if a.source.value == "MODIS"),
                "VIIRS": sum(1 for a in alerts if a.source.value == "VIIRS"),
            },
        }
