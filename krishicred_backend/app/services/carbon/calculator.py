"""Carbon credit calculation service."""
import logging
from typing import Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import CarbonCreditException, ValidationException
from app.core.logging import get_logger
from app.models.biogas_plant import BiogasPlant
from app.models.carbon_credit import CarbonCredit, CreditStatus
from app.models.route import Route
from app.schemas.carbon_credit import CarbonCreditCreate

settings = get_settings()
logger = get_logger(__name__)


class CreditCalculator:
    """
    Service for calculating carbon credits from stubble collection.

    Uses standard emission factors and conversion ratios to calculate
    CO2e emissions prevented.
    """

    def __init__(self, db: Optional[AsyncSession] = None):
        """Initialize calculator."""
        self.db = db

    def calculate(
        self,
        stubble_tons: float,
        co2e_per_ton: float = 2.5,
        conversion_efficiency: float = 0.95,
    ) -> dict[str, Any]:
        """
        Calculate carbon credits from stubble quantity.

        Args:
            stubble_tons: Amount of stubble processed
            co2e_per_ton: CO2e emissions prevented per ton of stubble
            conversion_efficiency: Efficiency factor for credit calculation

        Returns:
            Dict with calculation results
        """
        # Calculate CO2e prevented
        co2e_averted_tons = stubble_tons * co2e_per_ton

        # Apply efficiency factor
        credit_amount = co2e_averted_tons * conversion_efficiency

        # Only issue credits above minimum threshold
        if credit_amount < settings.MIN_CREDIT_ISSUANCE_TONS:
            logger.warning(
                f"Credit amount {credit_amount} below minimum "
                f"{settings.MIN_CREDIT_ISSUANCE_TONS}"
            )

        return {
            "stubble_tons": stubble_tons,
            "co2e_per_ton": co2e_per_ton,
            "conversion_efficiency": conversion_efficiency,
            "co2e_averted_tons": co2e_averted_tons,
            "credit_amount": credit_amount,
        }

    async def create_credit(self, credit_data: CarbonCreditCreate) -> CarbonCredit:
        """
        Create a new carbon credit record.

        Args:
            credit_data: Credit creation data

        Returns:
            Created CarbonCredit instance
        """
        if not self.db:
            raise CarbonCreditException("Database session required")

        # Validate plant exists
        plant_result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == credit_data.plant_id)
        )
        plant = plant_result.scalar_one_or_none()
        if not plant:
            raise ValidationException("Plant not found", "plant_id")

        # Validate route if provided
        if credit_data.route_id:
            route_result = await self.db.execute(
                select(Route).where(Route.id == credit_data.route_id)
            )
            route = route_result.scalar_one_or_none()
            if not route:
                raise ValidationException("Route not found", "route_id")

            # Use route's collected amount if not specified
            if credit_data.stubble_tons == 0 and route.collected_tons > 0:
                credit_data.stubble_tons = route.collected_tons

        # Generate credit code
        credit_code = self._generate_credit_code()

        # Calculate credits
        calculation = self.calculate(
            stubble_tons=credit_data.stubble_tons,
            co2e_per_ton=settings.STUBBLE_TO_CO2_CONVERSION_RATIO,
        )

        # Create credit record
        credit = CarbonCredit(
            credit_code=credit_code,
            plant_id=credit_data.plant_id,
            route_id=credit_data.route_id,
            stubble_tons=calculation["stubble_tons"],
            co2e_averted_tons=calculation["co2e_averted_tons"],
            credit_amount=calculation["credit_amount"],
            status=CreditStatus.PENDING,
            verification_level="self",
        )

        # Set estimated value
        credit.total_value_inr = (
            calculation["credit_amount"] * settings.CREDIT_PRICE_PER_TON_INR
        )

        self.db.add(credit)
        await self.db.commit()
        await self.db.refresh(credit)

        logger.info(
            f"Created carbon credit {credit.credit_code}: "
            f"{credit.credit_amount} tons CO2e"
        )

        return credit

    async def create_credit_from_dict(self, credit_data: dict) -> CarbonCredit:
        """Create credit from dictionary (for task processing)."""
        schema_data = CarbonCreditCreate(**credit_data)
        return await self.create_credit(schema_data)

    async def create_credit_from_route(self, route: Route) -> Optional[CarbonCredit]:
        """
        Automatically create credit from completed route.

        Args:
            route: Completed route

        Returns:
            Created CarbonCredit or None if ineligible
        """
        # Check eligibility
        if route.status != "completed" or route.collected_tons == 0:
            return None

        # Check if credit already exists
        from app.repositories.carbon_credit import CarbonCreditRepository
        repo = CarbonCreditRepository(self.db)
        existing = await repo.get_by_route(route.id)
        if existing:
            return None

        # Create credit
        credit_data = CarbonCreditCreate(
            plant_id=route.destination_plant_id,
            route_id=route.id,
            stubble_tons=route.collected_tons,
        )

        return await self.create_credit(credit_data)

    async def batch_create_credits(
        self,
        route_ids: list[UUID],
    ) -> list[CarbonCredit]:
        """
        Create credits for multiple routes.

        Args:
            route_ids: List of route UUIDs

        Returns:
            List of created credits
        """
        credits = []

        for route_id in route_ids:
            try:
                # Get route
                result = await self.db.execute(
                    select(Route).where(Route.id == route_id)
                )
                route = result.scalar_one_or_none()

                if route and route.status == "completed":
                    credit = await self.create_credit_from_route(route)
                    if credit:
                        credits.append(credit)

            except Exception as e:
                logger.error(f"Failed to create credit for route {route_id}: {e}")
                continue

        logger.info(f"Batch created {len(credits)} credits from {len(route_ids)} routes")
        return credits

    def _generate_credit_code(self) -> str:
        """Generate unique credit code."""
        import random
        import string
        from datetime import datetime

        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_str = "".join(random.choices(string.digits, k=8))
        return f"CC-{timestamp}-{random_str}"

    async def get_credit_value_estimate(
        self,
        stubble_tons: float,
    ) -> dict[str, Any]:
        """
        Get estimated credit value for a quantity of stubble.

        Args:
            stubble_tons: Amount of stubble

        Returns:
            Dict with value breakdown
        """
        calculation = self.calculate(stubble_tons)

        # Current market price (configurable)
        price_per_ton = settings.CREDIT_PRICE_PER_TON_INR

        # Apply market factor (actual market may vary)
        market_factor = 0.9  # Conservative estimate
        actual_value = calculation["credit_amount"] * price_per_ton * market_factor

        return {
            "stubble_tons": stubble_tons,
            "credit_amount_tons": calculation["credit_amount"],
            "price_per_ton_inr": price_per_ton,
            "market_factor": market_factor,
            "estimated_value_inr": actual_value,
            "conservative_value_inr": actual_value * 0.8,  # 20% buffer
        }

    async def get_farmers_by_credit(
        self,
        credit_id: UUID,
    ) -> list[dict]:
        """
        Get farmers associated with a carbon credit.

        Credits may aggregate multiple routes/farmers.
        """
        from app.repositories.route import RouteRepository
        from app.repositories.carbon_credit import CarbonCreditRepository

        credit_repo = CarbonCreditRepository(self.db)
        credit = await credit_repo.get(credit_id)

        if not credit or not credit.route_id:
            return []

        # Get route
        route_repo = RouteRepository(self.db)
        route = await route_repo.get(credit.route_id)

        if not route:
            return []

        # Get farmers from route stops
        farmers = []
        if route.stops:
            for stop in route.stops:
                farmer_result = await self.db.execute(
                    select(Farmer).where(Farmer.id == stop.farmer_id)
                )
                farmer = farmer_result.scalar_one_or_none()
                if farmer:
                    farmers.append({
                        "id": str(farmer.id),
                        "name": farmer.name,
                        "village": farmer.village,
                        "district": farmer.district,
                        "contributed_tons": stop.collected_quantity_tons,
                    })

        return farmers
