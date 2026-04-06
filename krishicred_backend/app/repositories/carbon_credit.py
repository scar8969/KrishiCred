"""Repository for CarbonCredit database operations."""
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.carbon_credit import CarbonCredit, Transaction, CreditStatus, VerificationLevel
from app.schemas.carbon_credit import CreditQueryParams


class CarbonCreditRepository:
    """Repository for CarbonCredit model operations."""

    def __init__(self, db: AsyncSession):
        """Initialize repository with database session."""
        self.db = db

    async def get(self, credit_id: UUID) -> Optional[CarbonCredit]:
        """Get a carbon credit by ID."""
        result = await self.db.execute(
            select(CarbonCredit)
            .where(CarbonCredit.id == credit_id)
            .options(
                selectinload(CarbonCredit.route),
                selectinload(CarbonCredit.plant),
                selectinload(CarbonCredit.farmer),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, credit_data: dict[str, Any]) -> CarbonCredit:
        """Create a new carbon credit."""
        credit = CarbonCredit(**credit_data)
        self.db.add(credit)
        await self.db.commit()
        await self.db.refresh(credit)
        return credit

    async def update(
        self,
        credit_id: UUID,
        update_data: dict[str, Any],
    ) -> Optional[CarbonCredit]:
        """Update a carbon credit."""
        result = await self.db.execute(
            update(CarbonCredit)
            .where(CarbonCredit.id == credit_id)
            .values(**update_data)
            .returning(CarbonCredit)
        )
        await self.db.commit()

        credit = result.scalar_one_or_none()
        if credit:
            await self.db.refresh(credit)
        return credit

    async def delete(self, credit_id: UUID) -> bool:
        """Delete a carbon credit."""
        result = await self.db.execute(
            select(CarbonCredit).where(CarbonCredit.id == credit_id)
        )
        credit = result.scalar_one_or_none()

        if credit:
            await self.db.delete(credit)
            await self.db.commit()
            return True
        return False

    async def list_credits(
        self,
        page: int = 1,
        page_size: int = 20,
        params: Optional[CreditQueryParams] = None,
    ) -> tuple[list[CarbonCredit], int]:
        """List carbon credits with filtering and pagination."""
        params = params or CreditQueryParams()

        # Build base query
        query = select(CarbonCredit).options(
            selectinload(CarbonCredit.route),
            selectinload(CarbonCredit.plant),
            selectinload(CarbonCredit.farmer),
        )

        # Apply filters
        if params.status:
            query = query.where(CarbonCredit.status == params.status)
        if params.plant_id:
            query = query.where(CarbonCredit.plant_id == params.plant_id)
        if params.verification_level:
            query = query.where(CarbonCredit.verification_level == params.verification_level)
        if params.date_from:
            query = query.where(CarbonCredit.created_at >= params.date_from)
        if params.date_to:
            query = query.where(CarbonCredit.created_at <= params.date_to)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(CarbonCredit.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        credits = list(result.scalars().all())

        return credits, total

    async def get_stats(
        self,
        days: int = 30,
    ) -> dict[str, Any]:
        """Get carbon credit statistics for the specified period."""
        cutoff = datetime.utcnow() - timedelta(days=days)

        # Total credits
        total_result = await self.db.execute(
            select(func.count()).where(CarbonCredit.created_at >= cutoff)
        )
        total_credits = total_result.scalar() or 0

        # Total credit amount (tons)
        amount_result = await self.db.execute(
            select(func.sum(CarbonCredit.credit_amount))
            .where(CarbonCredit.created_at >= cutoff)
        )
        total_amount = float(amount_result.scalar() or 0)

        # Credits by status
        status_result = await self.db.execute(
            select(CarbonCredit.status, func.count())
            .where(CarbonCredit.created_at >= cutoff)
            .group_by(CarbonCredit.status)
        )
        by_status = {status.value: count for status, count in status_result.all()}

        # Credits by verification level
        level_result = await self.db.execute(
            select(CarbonCredit.verification_level, func.count())
            .where(CarbonCredit.created_at >= cutoff)
            .group_by(CarbonCredit.verification_level)
        )
        by_level = {level.value: count for level, count in level_result.all()}

        # Total value
        value_result = await self.db.execute(
            select(func.sum(CarbonCredit.total_value_inr))
            .where(CarbonCredit.created_at >= cutoff)
        )
        total_value = float(value_result.scalar() or 0)

        return {
            "total_credits": total_credits,
            "total_amount_tons": total_amount,
            "total_value_inr": total_value,
            "by_status": by_status,
            "by_verification_level": by_level,
            "certified_credits": by_status.get(CreditStatus.CERTIFIED.value, 0),
            "verified_credits": by_status.get(CreditStatus.VERIFIED.value, 0),
            "sold_credits": by_status.get(CreditStatus.SOLD.value, 0),
        }

    async def get_by_plant(
        self,
        plant_id: UUID,
        status: Optional[CreditStatus] = None,
        limit: int = 50,
    ) -> list[CarbonCredit]:
        """Get carbon credits for a specific plant."""
        query = select(CarbonCredit).where(CarbonCredit.plant_id == plant_id)

        if status:
            query = query.where(CarbonCredit.status == status)

        query = query.options(
            selectinload(CarbonCredit.route),
            selectinload(CarbonCredit.plant),
            selectinload(CarbonCredit.farmer),
        )
        query = query.order_by(CarbonCredit.created_at.desc()).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_farmer(
        self,
        farmer_id: UUID,
        status: Optional[CreditStatus] = None,
        limit: int = 50,
    ) -> list[CarbonCredit]:
        """Get carbon credits for a specific farmer."""
        query = select(CarbonCredit).where(CarbonCredit.farmer_id == farmer_id)

        if status:
            query = query.where(CarbonCredit.status == status)

        query = query.options(
            selectinload(CarbonCredit.route),
            selectinload(CarbonCredit.plant),
            selectinload(CarbonCredit.farmer),
        )
        query = query.order_by(CarbonCredit.created_at.desc()).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_route(
        self,
        route_id: UUID,
    ) -> Optional[CarbonCredit]:
        """Get carbon credit for a specific route."""
        result = await self.db.execute(
            select(CarbonCredit)
            .where(CarbonCredit.route_id == route_id)
            .options(
                selectinload(CarbonCredit.route),
                selectinload(CarbonCredit.plant),
                selectinload(CarbonCredit.farmer),
            )
        )
        return result.scalar_one_or_none()

    async def list_transactions(
        self,
        credit_id: Optional[UUID] = None,
        limit: int = 50,
    ) -> list[Transaction]:
        """List transactions, optionally filtered by credit."""
        query = select(Transaction)

        if credit_id:
            query = query.where(Transaction.credit_id == credit_id)

        query = query.order_by(Transaction.created_at.desc()).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_transaction(
        self,
        transaction_data: dict[str, Any],
    ) -> Transaction:
        """Create a new transaction."""
        transaction = Transaction(**transaction_data)
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def get_pending_credits(
        self,
        limit: int = 100,
    ) -> list[CarbonCredit]:
        """Get credits pending verification."""
        result = await self.db.execute(
            select(CarbonCredit)
            .where(CarbonCredit.status == CreditStatus.PENDING)
            .options(
                selectinload(CarbonCredit.route),
                selectinload(CarbonCredit.plant),
            )
            .order_by(CarbonCredit.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_verifiable_credits(
        self,
        min_tons: float = 0.1,
        limit: int = 100,
    ) -> list[CarbonCredit]:
        """Get credits ready for verification."""
        result = await self.db.execute(
            select(CarbonCredit)
            .where(
                CarbonCredit.status == CreditStatus.PENDING,
                CarbonCredit.credit_amount >= min_tons,
            )
            .options(
                selectinload(CarbonCredit.route),
                selectinload(CarbonCredit.plant),
            )
            .order_by(CarbonCredit.credit_amount.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
