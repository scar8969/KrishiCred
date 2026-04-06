"""Notification tasks for WhatsApp messaging."""
import logging
from datetime import datetime, timedelta

from celery import shared_task

from app.core.logging import get_logger
from app.db.session import async_session_maker

logger = get_logger(__name__)


@shared_task(
    name="app.tasks.notification_tasks.send_daily_summary",
    bind=True,
)
def send_daily_summary(self) -> dict:
    """
    Send daily summary to plant operators and administrators.

    Includes fires detected, routes completed, stubble collected, and credits generated.
    """
    import asyncio

    async def _send():
        async with async_session_maker() as db:
            from app.repositories.fire_alert import FireAlertRepository
            from app.repositories.route import RouteRepository
            from app.repositories.carbon_credit import CarbonCreditRepository
            from app.repositories.biogas_plant import BiogasPlantRepository
            from app.utils.whatsapp import WhatsAppClient

            alert_repo = FireAlertRepository(db)
            route_repo = RouteRepository(db)
            credit_repo = CarbonCreditRepository(db)
            plant_repo = BiogasPlantRepository(db)
            whatsapp = WhatsAppClient()

            # Get yesterday's date range
            yesterday = datetime.utcnow() - timedelta(days=1)
            start_of_day = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)

            results = {
                "date": yesterday.date().isoformat(),
                "fires_detected": 0,
                "alerts_sent": 0,
                "routes_completed": 0,
                "stubble_collected": 0.0,
                "credits_generated": 0.0,
                "notifications_sent": 0,
                "errors": [],
            }

            try:
                # Get fire alert stats
                alerts = await alert_repo.get_by_date_range(start_of_day, end_of_day)
                results["fires_detected"] = len(alerts)
                results["alerts_sent"] = sum(a.alert_sent for a in alerts)

                # Get route completion stats
                routes = await route_repo.get_completed_by_date_range(start_of_day, end_of_day)
                results["routes_completed"] = len(routes)
                results["stubble_collected"] = sum(r.collected_tons for r in routes)

                # Get credit stats
                credits = await credit_repo.get_created_by_date_range(start_of_day, end_of_day)
                results["credits_generated"] = sum(c.credit_amount for c in credits)

                # Get plants to notify
                plants = await plant_repo.get_active_plants()

                for plant in plants:
                    try:
                        # Get plant-specific stats
                        plant_routes = [r for r in routes if r.destination_plant_id == plant.id]
                        plant_stubble = sum(r.collected_tons for r in plant_routes)

                        # Send WhatsApp message to plant contact
                        await whatsapp.send_daily_summary(
                            phone_number=plant.contact_phone,
                            plant_name=plant.name,
                            date=yesterday.date(),
                            routes_completed=len(plant_routes),
                            stubble_collected=plant_stubble,
                            fires_detected=results["fires_detected"],
                        )

                        results["notifications_sent"] += 1

                    except Exception as e:
                        error_msg = f"Failed to send to plant {plant.id}: {str(e)}"
                        logger.error(error_msg)
                        results["errors"].append(error_msg)

                logger.info(f"Daily summary sent: {results}")
                return results

            except Exception as e:
                logger.error(f"Daily summary failed: {str(e)}", exc_info=True)
                results["errors"].append(str(e))
                return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_send())


@shared_task(
    name="app.tasks.notification_tasks.send_collection_reminder",
    bind=True,
)
def send_collection_reminder(self, route_id: str) -> dict:
    """
    Send reminder to farmers about upcoming collection.

    Sent 24 hours before scheduled collection.
    """
    import asyncio
    from uuid import UUID

    async def _send():
        async with async_session_maker() as db:
            from app.repositories.route import RouteRepository
            from app.repositories.farmer import FarmerRepository
            from app.utils.whatsapp import WhatsAppClient

            route_repo = RouteRepository(db)
            farmer_repo = FarmerRepository(db)
            whatsapp = WhatsAppClient()

            route = await route_repo.get(UUID(route_id))
            if not route:
                return {"error": "Route not found"}

            farmer = await farmer_repo.get(route.origin_farm_id)
            if not farmer:
                return {"error": "Farmer not found"}

            results = {
                "route_id": route_id,
                "farmer_id": str(farmer.id),
                "sent": False,
            }

            try:
                await whatsapp.send_collection_reminder(
                    phone_number=farmer.phone,
                    farmer_name=farmer.name,
                    scheduled_time=route.scheduled_at,
                    quantity_tons=route.quantity_tons,
                )
                results["sent"] = True

            except Exception as e:
                logger.error(f"Failed to send reminder: {str(e)}")
                results["error"] = str(e)

            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_send())


@shared_task(
    name="app.tasks.notification_tasks.send_payment_confirmation",
    bind=True,
)
def send_payment_confirmation(self, transaction_id: str) -> dict:
    """
    Send payment confirmation to farmer.

    Sent when stubble payment is processed.
    """
    import asyncio
    from uuid import UUID

    async def _send():
        async with async_session_maker() as db:
            from app.repositories.carbon_credit import CarbonCreditRepository
            from app.repositories.farmer import FarmerRepository
            from app.utils.whatsapp import WhatsAppClient

            credit_repo = CarbonCreditRepository(db)
            farmer_repo = FarmerRepository(db)
            whatsapp = WhatsAppClient()

            # Get transaction details
            transaction = await credit_repo.get_transaction(UUID(transaction_id))
            if not transaction:
                return {"error": "Transaction not found"}

            # Get credit to find associated route
            credit = await credit_repo.get(transaction.credit_id)
            if not credit or not credit.route_id:
                return {"error": "Associated route not found"}

            # Get route to find farmer
            from app.repositories.route import RouteRepository
            route_repo = RouteRepository(db)
            route = await route_repo.get(credit.route_id)

            if not route:
                return {"error": "Route not found"}

            farmer = await farmer_repo.get(route.origin_farm_id)
            if not farmer:
                return {"error": "Farmer not found"}

            results = {
                "transaction_id": transaction_id,
                "farmer_id": str(farmer.id),
                "sent": False,
            }

            try:
                await whatsapp.send_payment_confirmation(
                    phone_number=farmer.phone,
                    farmer_name=farmer.name,
                    amount_inr=transaction.amount_inr,
                    stubble_tons=route.collected_tons,
                    transaction_code=transaction.transaction_code,
                )
                results["sent"] = True

            except Exception as e:
                logger.error(f"Failed to send payment confirmation: {str(e)}")
                results["error"] = str(e)

            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_send())
