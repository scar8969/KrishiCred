"""Satellite data processing tasks."""
import logging
from datetime import datetime, timedelta

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.session import async_session_maker
from app.services.firewatch.detector import FireDetector
from app.services.firewatch.alerting import AlertManager

settings = get_settings()
logger = get_logger(__name__)


@shared_task(
    name="app.tasks.satellite_tasks.process_satellite_data",
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # 5 minutes
)
def process_satellite_data(self, hours_back: int = 6) -> dict:
    """
    Process satellite data to detect fires.

    Fetches MODIS/VIIRS data from Google Earth Engine for the
    specified time period and creates fire alerts.

    Args:
        hours_back: Number of hours to look back for fire data

    Returns:
        Dict with processing results
    """
    from app.tasks.celery_app import celery_app
    import asyncio

    async def _process():
        async with async_session_maker() as db:
            detector = FireDetector(db)
            alert_manager = AlertManager(db)

            logger.info(f"Starting satellite data processing for {hours_back} hours back")

            # Calculate time range
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=hours_back)

            results = {
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "fires_detected": 0,
                "alerts_created": 0,
                "farmers_matched": 0,
                "alerts_sent": 0,
                "errors": [],
            }

            try:
                # Process MODIS data
                logger.info("Processing MODIS satellite data")
                modis_fires = await detector.process_modis_data(start_time, end_time)
                logger.info(f"MODIS: Found {len(modis_fires)} potential fires")

                # Process VIIRS data
                logger.info("Processing VIIRS satellite data")
                viirs_fires = await detector.process_viirs_data(start_time, end_time)
                logger.info(f"VIIRS: Found {len(viirs_fires)} potential fires")

                all_fires = modis_fires + viirs_fires
                results["fires_detected"] = len(all_fires)

                # Create alerts for high-confidence detections
                for fire_data in all_fires:
                    if fire_data.get("confidence", 0) >= settings.FIRE_CONFIDENCE_THRESHOLD:
                        try:
                            alert = await detector.create_alert_from_satellite(fire_data)

                            # Match with nearby farmers
                            matched_count = await detector.match_nearby_farmers(alert)
                            results["farmers_matched"] += matched_count

                            # Send alerts if farmers found
                            if matched_count > 0 and alert.requires_alert:
                                await alert_manager.send_alerts(alert.id)
                                results["alerts_sent"] += 1

                            results["alerts_created"] += 1

                        except Exception as e:
                            error_msg = f"Error processing fire {fire_data.get('satellite_id')}: {str(e)}"
                            logger.error(error_msg)
                            results["errors"].append(error_msg)

                logger.info(f"Satellite processing complete: {results}")
                return results

            except Exception as e:
                logger.error(f"Satellite processing failed: {str(e)}", exc_info=True)
                results["errors"].append(f"Processing failed: {str(e)}")
                raise

    # Run async function in sync context
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_process())


@shared_task(
    name="app.tasks.satellite_tasks.send_fire_alerts",
    bind=True,
    max_retries=3,
)
def send_fire_alerts(self, alert_id: str, farmer_ids: list[str]) -> dict:
    """
    Send WhatsApp alerts to farmers about detected fires.

    Args:
        alert_id: UUID of the fire alert
        farmer_ids: List of farmer UUIDs to alert

    Returns:
        Dict with sending results
    """
    import asyncio

    async def _send():
        async with async_session_maker() as db:
            from app.services.firewatch.alerting import AlertManager
            from app.repositories.fire_alert import FireAlertRepository
            from app.utils.whatsapp import WhatsAppClient
            import uuid

            alert_repo = FireAlertRepository(db)
            whatsapp = WhatsAppClient()

            alert = await alert_repo.get(uuid.UUID(alert_id))
            if not alert:
                logger.error(f"Alert {alert_id} not found")
                return {"error": "Alert not found"}

            results = {
                "alert_id": alert_id,
                "total_farmers": len(farmer_ids),
                "sent": 0,
                "failed": 0,
                "errors": [],
            }

            for farmer_id in farmer_ids:
                try:
                    # Get farmer details
                    from app.repositories.farmer import FarmerRepository
                    farmer_repo = FarmerRepository(db)
                    farmer = await farmer_repo.get(uuid.UUID(farmer_id))

                    if not farmer or not farmer.whatsapp_opt_in:
                        continue

                    # Send WhatsApp message in Punjabi
                    await whatsapp.send_fire_alert(
                        phone_number=farmer.phone,
                        farmer_name=farmer.name,
                        location_name=farmer.village,
                        detection_time=alert.detection_time,
                    )

                    results["sent"] += 1

                except Exception as e:
                    error_msg = f"Failed to send to farmer {farmer_id}: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)
                    results["failed"] += 1

            # Update alert
            await alert_repo.update_alerts_sent(uuid.UUID(alert_id), results["sent"])

            logger.info(f"Fire alerts sent: {results}")
            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_send())


@shared_task(
    name="app.tasks.satellite_tasks.cleanup_old_alerts",
    bind=True,
)
def cleanup_old_alerts(self, days_to_keep: int = 30) -> dict:
    """
    Clean up old resolved alerts to manage database size.

    Args:
        days_to_keep: Number of days of alerts to retain

    Returns:
        Dict with cleanup results
    """
    import asyncio

    async def _cleanup():
        async with async_session_maker() as db:
            from app.repositories.fire_alert import FireAlertRepository

            repo = FireAlertRepository(db)
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

            deleted = await repo.delete_old_resolved_alerts(cutoff_date)

            logger.info(f"Cleaned up {deleted} old alerts")
            return {"deleted_count": deleted, "cutoff_date": cutoff_date.isoformat()}

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_cleanup())
