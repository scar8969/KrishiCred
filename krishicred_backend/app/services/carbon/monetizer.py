"""Carbon credit monetization service."""
import logging
import random
import string
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.exceptions import CarbonCreditException, ValidationException
from app.core.logging import get_logger
from app.models.carbon_credit import CarbonCredit, CreditStatus, Transaction
from app.models.farmer import Farmer
from app.models.route import Route

settings = get_settings()
logger = get_logger(__name__)


class CreditMonetizer:
    """
    Service for monetizing carbon credits.

    Handles credit sales, payments to farmers, and transaction tracking.
    """

    def __init__(self, db: AsyncSession):
        """Initialize monetizer with database session."""
        self.db = db

    async def sell(
        self,
        credit_id: UUID,
        price_per_ton: float,
        buyer_name: str,
        buyer_id: str,
        payment_method: str = "bank_transfer",
    ) -> Optional[dict]:
        """
        Sell a carbon credit.

        Args:
            credit_id: UUID of the credit to sell
            price_per_ton: Selling price per ton
            buyer_name: Name of buyer
            buyer_id: ID of buyer
            payment_method: Payment method

        Returns:
            Dict with sale details or None
        """
        result = await self.db.execute(
            select(CarbonCredit)
            .options(selectinload(CarbonCredit.plant))
            .where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if not credit:
            logger.error(f"Credit {credit_id} not found")
            return None

        if not credit.is_sellable:
            raise ValidationException(
                f"Credit {credit_id} is not sellable (status: {credit.status})"
            )

        # Calculate total value
        amount_inr = credit.credit_amount * price_per_ton

        # Update credit
        credit.mark_sold(price_per_ton)

        # Create transaction
        transaction = Transaction(
            transaction_code=self._generate_transaction_code(),
            credit_id=credit_id,
            counterparty_id=buyer_id,
            amount_inr=amount_inr,
            type="sale",
            status="completed",
            payment_method=payment_method,
            payment_reference=f"SALE-{credit.credit_code}-{datetime.utcnow().strftime('%Y%m%d')}",
            processed_at=datetime.utcnow(),
            metadata={
                "buyer_name": buyer_name,
                "buyer_id": buyer_id,
                "credit_amount": credit.credit_amount,
                "price_per_ton": price_per_ton,
            },
        )

        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(credit)

        logger.info(
            f"Sold credit {credit.credit_code}: {amount_inr} INR "
            f"to {buyer_name} at {price_per_ton} INR/ton"
        )

        # Distribute earnings
        await self._distribute_earnings(credit, amount_inr)

        return {
            "transaction_id": str(transaction.id),
            "amount_inr": amount_inr,
            "status": "completed",
        }

    async def _distribute_earnings(
        self,
        credit: CarbonCredit,
        total_amount: float,
    ) -> None:
        """
        Distribute credit sale earnings.

        Splits earnings between:
        - Farmer payment for stubble
        - Plant operator fee
        - Platform commission
        """
        if not credit.route_id:
            logger.warning(f"No route for credit {credit.id}, cannot distribute earnings")
            return

        # Get route
        route_result = await self.db.execute(
            select(Route).where(Route.id == credit.route_id)
        )
        route = route_result.scalar_one_or_none()

        if not route:
            return

        # Get farmer
        farmer_result = await self.db.execute(
            select(Farmer).where(Farmer.id == route.origin_farm_id)
        )
        farmer = farmer_result.scalar_one_or_none()

        if not farmer:
            return

        # Calculate distribution
        # Standard split: 60% farmer, 30% plant, 10% platform
        farmer_share = total_amount * 0.60
        plant_share = total_amount * 0.30
        platform_share = total_amount * 0.10

        # Pay farmer
        if farmer_share > 0:
            await self._pay_farmer(
                farmer_id=farmer.id,
                amount=farmer_share,
                credit_id=credit.id,
                reference=f"CREDIT-{credit.credit_code}",
            )

        # Pay plant
        if plant_share > 0:
            await self._pay_plant(
                plant_id=credit.plant_id,
                amount=plant_share,
                credit_id=credit.id,
                reference=f"CREDIT-{credit.credit_code}",
            )

        logger.info(
            f"Distributed earnings for credit {credit.credit_code}: "
            f"farmer={farmer_share:.2f}, plant={plant_share:.2f}, "
            f"platform={platform_share:.2f}"
        )

    async def _pay_farmer(
        self,
        farmer_id: UUID,
        amount: float,
        credit_id: UUID,
        reference: str,
    ) -> Transaction:
        """Create payment transaction for farmer."""
        transaction = Transaction(
            transaction_code=self._generate_transaction_code("PAY"),
            credit_id=credit_id,
            counterparty_id=str(farmer_id),
            amount_inr=amount,
            type="payment",
            status="pending",
            payment_method="upi",  # Default to UPI for Indian farmers
            payment_reference=reference,
            metadata={
                "recipient_type": "farmer",
                "reference": reference,
            },
        )

        self.db.add(transaction)
        await self.db.flush()

        # TODO: Initiate actual payment via payment gateway

        return transaction

    async def _pay_plant(
        self,
        plant_id: UUID,
        amount: float,
        credit_id: UUID,
        reference: str,
    ) -> Transaction:
        """Create payment transaction for plant."""
        transaction = Transaction(
            transaction_code=self._generate_transaction_code("PAY"),
            credit_id=credit_id,
            counterparty_id=str(plant_id),
            amount_inr=amount,
            type="payment",
            status="pending",
            payment_method="bank_transfer",
            payment_reference=reference,
            metadata={
                "recipient_type": "plant",
                "reference": reference,
            },
        )

        self.db.add(transaction)
        await self.db.flush()

        # TODO: Initiate actual payment via payment gateway

        return transaction

    async def get_market_value(
        self,
        credit_amount: float,
    ) -> dict:
        """
        Get estimated market value for credits.

        Args:
            credit_amount: Amount of credits in tons CO2e

        Returns:
            Dict with value estimates
        """
        # Base price from config
        base_price = settings.CREDIT_PRICE_PER_TON_INR

        # Apply market factors (simplified)
        # In production, fetch from actual market data
        market_multiplier = 1.0  # Can vary based on demand

        conservative_price = base_price * 0.8
        optimistic_price = base_price * 1.2

        return {
            "credit_amount_tons": credit_amount,
            "base_price_per_ton": base_price,
            "conservative_value": credit_amount * conservative_price,
            "expected_value": credit_amount * base_price * market_multiplier,
            "optimistic_value": credit_amount * optimistic_price,
            "market_multiplier": market_multiplier,
        }

    async def get_sellable_credits(
        self,
        plant_id: Optional[UUID] = None,
    ) -> list[CarbonCredit]:
        """Get all certified credits available for sale."""
        query = select(CarbonCredit).where(
            CarbonCredit.status == CreditStatus.CERTIFIED
        )

        if plant_id:
            query = query.where(CarbonCredit.plant_id == plant_id)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_listing(
        self,
        credit_id: UUID,
        asking_price: float,
        marketplace: str = "internal",
    ) -> dict:
        """
        List credit for sale on marketplace.

        Args:
            credit_id: UUID of credit to list
            asking_price: Price per ton requested
            marketplace: Marketplace to list on

        Returns:
            Dict with listing details
        """
        result = await self.db.execute(
            select(CarbonCredit).where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if not credit:
            raise CarbonCreditException(f"Credit {credit_id} not found")

        if not credit.is_sellable:
            raise ValidationException(f"Credit {credit_id} is not sellable")

        # Add listing to metadata
        credit.metadata["listing"] = {
            "marketplace": marketplace,
            "asking_price": asking_price,
            "listed_at": datetime.utcnow().isoformat(),
            "status": "active",
        }

        await self.db.commit()
        await self.db.refresh(credit)

        return {
            "credit_id": str(credit_id),
            "credit_amount": credit.credit_amount,
            "asking_price_per_ton": asking_price,
            "total_asking_value": credit.credit_amount * asking_price,
            "marketplace": marketplace,
            "listed_at": credit.metadata["listing"]["listed_at"],
        }

    def _generate_transaction_code(self, prefix: str = "TXN") -> str:
        """Generate unique transaction code."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_str = "".join(random.choices(string.digits, k=6))
        return f"{prefix}-{timestamp}-{random_str}"

    async def get_revenue_summary(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> dict:
        """
        Get revenue summary for a date range.

        Args:
            start_date: Start of period
            end_date: End of period

        Returns:
            Dict with revenue breakdown
        """
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.type == "sale")
            .where(Transaction.processed_at >= start_date)
            .where(Transaction.processed_at <= end_date)
        )

        transactions = list(result.scalars().all())

        total_revenue = sum(t.amount_inr for t in transactions)
        total_credits = len(transactions)

        return {
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "total_transactions": total_credits,
            "total_revenue_inr": total_revenue,
            "average_transaction_value": total_revenue / total_credits if total_credits > 0 else 0,
            "transactions": [
                {
                    "code": t.transaction_code,
                    "amount": t.amount_inr,
                    "date": t.processed_at.isoformat() if t.processed_at else None,
                }
                for t in transactions
            ],
        }
