"""Carbon credit calculation and verification tasks."""
import logging
from datetime import datetime, timedelta

from celery import shared_task

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.session import async_session_maker

settings = get_settings()
logger = get_logger(__name__)


@shared_task(
    name="app.tasks.carbon_tasks.process_pending_credits",
    bind=True,
)
def process_pending_credits(self) -> dict:
    """
    Calculate and create carbon credits for completed routes.

    Automatically processes routes that have been completed but
    don't have carbon credits yet.
    """
    import asyncio

    async def _process():
        async with async_session_maker() as db:
            from app.repositories.route import RouteRepository
            from app.repositories.carbon_credit import CarbonCreditRepository
            from app.services.carbon.calculator import CreditCalculator

            route_repo = RouteRepository(db)
            credit_repo = CarbonCreditRepository(db)
            calculator = CreditCalculator(db)

            # Get completed routes without credits
            routes = await route_repo.get_routes_needing_credits()

            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "routes_processed": 0,
                "credits_created": 0,
                "total_credits_tons": 0.0,
                "total_value_inr": 0.0,
                "errors": [],
            }

            for route in routes:
                try:
                    # Get plant for pricing
                    plant = await credit_repo.get_plant(route.destination_plant_id)
                    if not plant:
                        results["errors"].append(f"Plant not found for route {route.id}")
                        continue

                    # Check if credit already exists
                    existing = await credit_repo.get_by_route(route.id)
                    if existing:
                        continue

                    # Calculate and create credit
                    credit_data = {
                        "plant_id": plant.id,
                        "route_id": route.id,
                        "stubble_tons": route.collected_tons,
                    }

                    credit = await calculator.create_credit_from_dict(credit_data)

                    results["credits_created"] += 1
                    results["total_credits_tons"] += credit.credit_amount
                    results["total_value_inr"] += credit.total_value_inr or 0

                    logger.info(f"Created credit {credit.credit_code} for route {route.route_code}")

                except Exception as e:
                    error_msg = f"Error processing route {route.id}: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)

            logger.info(f"Carbon credit processing complete: {results}")
            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_process())


@shared_task(
    name="app.tasks.carbon_tasks.verify_pending_credits",
    bind=True,
    max_retries=2,
)
def verify_pending_credits(self, verification_level: str = "self") -> dict:
    """
    Verify pending carbon credits.

    Automatically verifies credits that have passed the verification
    period threshold.
    """
    import asyncio

    async def _verify():
        async with async_session_maker() as db:
            from app.repositories.carbon_credit import CarbonCreditRepository
            from app.services.carbon.verifier import CreditVerifier
            from app.models.carbon_credit import CreditStatus, VerificationLevel

            credit_repo = CarbonCreditRepository(db)
            verifier = CreditVerifier(db)

            # Get calculated credits old enough for verification
            cutoff_date = datetime.utcnow() - timedelta(
                days=settings.CREDIT_VERIFICATION_PERIOD_DAYS
            )
            credits = await credit_repo.get_pending_verification_credits(cutoff_date)

            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "total_credits": len(credits),
                "verified": 0,
                "errors": [],
            }

            for credit in credits:
                try:
                    await verifier.verify(
                        credit_id=credit.id,
                        level=VerificationLevel(verification_level),
                        verifier="System Verification",
                        notes="Auto-verified after verification period",
                    )
                    results["verified"] += 1

                    logger.info(f"Verified credit {credit.credit_code}")

                except Exception as e:
                    error_msg = f"Error verifying credit {credit.id}: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)

            logger.info(f"Credit verification complete: {results}")
            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_verify())


@shared_task(
    name="app.tasks.carbon_tasks.aggregate_credits",
    bind=True,
)
def aggregate_credits(self, plant_id: str = None, days: int = 30) -> dict:
    """
    Aggregate carbon credit statistics.

    Generates summary statistics for reporting and dashboards.
    """
    import asyncio
    from uuid import UUID

    async def _aggregate():
        async with async_session_maker() as db:
            from app.repositories.carbon_credit import CarbonCreditRepository

            credit_repo = CarbonCreditRepository(db)

            start_date = datetime.utcnow() - timedelta(days=days)

            if plant_id:
                stats = await credit_repo.get_plant_stats(UUID(plant_id), start_date)
                stats["plant_id"] = plant_id
            else:
                stats = await credit_repo.get_global_stats(start_date)

            stats["generated_at"] = datetime.utcnow().isoformat()
            stats["period_days"] = days

            logger.info(f"Credit aggregation complete: {stats}")
            return stats

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_aggregate())


@shared_task(
    name="app.tasks.carbon_tasks.check_credit_expiry",
    bind=True,
)
def check_credit_expiry(self) -> dict:
    """
    Check for expiring carbon credits.

    Sends alerts when credits are approaching expiry.
    """
    import asyncio

    async def _check():
        async with async_session_maker() as db:
            from app.repositories.carbon_credit import CarbonCreditRepository

            credit_repo = CarbonCreditRepository(db)

            # Get credits expiring in next 30 days
            expiry_threshold = datetime.utcnow() + timedelta(days=30)
            expiring_credits = await credit_repo.get_expiring_credits(expiry_threshold)

            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "expiring_soon": len(expiring_credits),
                "credits": [],
            }

            for credit in expiring_credits:
                days_until_expiry = (credit.expiry_date - datetime.utcnow()).days
                results["credits"].append({
                    "credit_id": str(credit.id),
                    "credit_code": credit.credit_code,
                    "amount": credit.credit_amount,
                    "expiry_date": credit.expiry_date.isoformat(),
                    "days_until_expiry": days_until_expiry,
                })

                logger.warning(
                    f"Credit {credit.credit_code} expires in {days_until_expiry} days"
                )

            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_check())


@shared_task(
    name="app.tasks.carbon_tasks.generate_certificate",
    bind=True,
)
def generate_certificate(self, credit_id: str) -> dict:
    """
    Generate verification certificate for a carbon credit.

    Creates a PDF certificate with verification details.
    """
    import asyncio
    from uuid import UUID

    async def _generate():
        async with async_session_maker() as db:
            from app.repositories.carbon_credit import CarbonCreditRepository
            from app.services.carbon.verifier import CreditVerifier

            credit_repo = CarbonCreditRepository(db)
            verifier = CreditVerifier(db)

            credit = await credit_repo.get(UUID(credit_id))
            if not credit:
                return {"error": "Credit not found"}

            # Generate certificate (in production, use a PDF library)
            certificate_id = f"CC-{credit.credit_code}-{datetime.utcnow().strftime('%Y%m%d')}"
            certificate_url = f"/certificates/{certificate_id}.pdf"

            # Update credit with certificate
            await verifier.certify(
                credit_id=UUID(credit_id),
                certificate_url=certificate_url,
                certificate_id=certificate_id,
                expiry_years=5,
            )

            return {
                "credit_id": credit_id,
                "certificate_id": certificate_id,
                "certificate_url": certificate_url,
            }

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_generate())
