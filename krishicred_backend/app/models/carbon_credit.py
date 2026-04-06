"""Carbon credit models for credit calculation and verification."""
from enum import Enum as PyEnum
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.biogas_plant import BiogasPlant
    from app.models.route import Route


class CreditStatus(str, PyEnum):
    """Status of a carbon credit."""

    PENDING = "pending"
    CALCULATED = "calculated"
    VERIFIED = "verified"
    CERTIFIED = "certified"
    SOLD = "sold"
    RETIRED = "retired"
    REJECTED = "rejected"


class VerificationLevel(str, PyEnum):
    """Verification level for carbon credits."""

    SELF = "self"
    THIRD_PARTY = "third_party"
    GOLD_STANDARD = "gold_standard"
    VERRA = "verra"


class CarbonCredit(Base, TimestampMixin):
    """
    Carbon credit model representing CO2e reduction credits.

    Credits are generated when stubble is diverted from burning
    to biogas plants, preventing methane and CO2 emissions.

    Attributes:
        id: Unique identifier
        plant_id: Associated biogas plant
        route_id: Associated collection route
        stubble_tons: Amount of stubble processed
        co2e_averted_tons: CO2e emissions averted
        credit_amount: Credit amount in tons CO2e
        status: Current credit status
        verification_level: Verification level achieved
        verification_date: When credit was verified
        certificate_url: URL to verification certificate
    """

    __tablename__ = "carbon_credits"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    credit_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )
    plant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("biogas_plants.id"),
        nullable=False,
        index=True,
    )
    route_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("routes.id"),
        nullable=True,
        index=True,
    )

    # Credit details
    stubble_tons: Mapped[float] = mapped_column(Float, nullable=False)
    co2e_averted_tons: Mapped[float] = mapped_column(Float, nullable=False)
    credit_amount: Mapped[float] = mapped_column(Float, nullable=False)

    # Status and verification
    status: Mapped[CreditStatus] = mapped_column(
        SQLEnum(CreditStatus),
        default=CreditStatus.PENDING,
        nullable=False,
        index=True,
    )
    verification_level: Mapped[VerificationLevel] = mapped_column(
        SQLEnum(VerificationLevel),
        default=VerificationLevel.SELF,
        nullable=False,
    )
    verification_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )
    verified_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Certification
    certificate_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    certificate_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Pricing
    price_per_ton: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_value_inr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Metadata for verification and audit trail
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    plant: Mapped["BiogasPlant"] = relationship("BiogasPlant", back_populates="carbon_credits")

    def __repr__(self) -> str:
        """String representation."""
        return f"CarbonCredit(id={self.id}, code={self.credit_code}, amount={self.credit_amount}t CO2e)"

    @property
    def is_verifiable(self) -> bool:
        """Check if credit can be verified."""
        return self.status in (CreditStatus.CALCULATED, CreditStatus.PENDING)

    @property
    def is_sellable(self) -> bool:
        """Check if credit can be sold."""
        return self.status == CreditStatus.CERTIFIED

    @property
    def total_value_inr(self) -> Optional[float]:
        """Calculate total value in INR."""
        if self.price_per_ton:
            return self.credit_amount * self.price_per_ton
        return None

    def calculate_credits(
        self,
        stubble_tons: float,
        co2e_per_ton: float = 2.5,
        conversion_efficiency: float = 0.95,
    ) -> None:
        """
        Calculate carbon credits from stubble quantity.

        Args:
            stubble_tons: Amount of stubble processed
            co2e_per_ton: CO2e emissions prevented per ton of stubble
            conversion_efficiency: Efficiency factor for credit calculation
        """
        self.stubble_tons = stubble_tons
        self.co2e_averted_tons = stubble_tons * co2e_per_ton
        self.credit_amount = self.co2e_averted_tons * conversion_efficiency
        self.status = CreditStatus.CALCULATED

    def mark_verified(
        self,
        level: VerificationLevel,
        verifier: str,
        certificate_id: Optional[str] = None,
    ) -> None:
        """Mark credit as verified."""
        self.status = CreditStatus.VERIFIED
        self.verification_level = level
        self.verification_date = datetime.utcnow()
        self.verified_by = verifier
        if certificate_id:
            self.certificate_id = certificate_id

    def mark_certified(
        self,
        certificate_url: str,
        expiry_years: int = 5,
    ) -> None:
        """Mark credit as certified."""
        self.status = CreditStatus.CERTIFIED
        self.certificate_url = certificate_url
        self.expiry_date = datetime.utcnow()

        # Import relativedelta for proper date calculation
        from dateutil.relativedelta import relativedelta
        self.expiry_date += relativedelta(years=expiry_years)

    def mark_sold(self, price_per_ton: float) -> None:
        """Mark credit as sold."""
        self.status = CreditStatus.SOLD
        self.price_per_ton = price_per_ton
        self.total_value_inr = self.credit_amount * price_per_ton


class Transaction(Base, TimestampMixin):
    """
    Transaction model for tracking carbon credit sales and payments.

    Attributes:
        id: Unique identifier
        credit_id: Associated carbon credit
        type: Transaction type (sale/payment)
        amount_inr: Transaction amount
        status: Transaction status
        reference_id: External reference ID
    """

    __tablename__ = "transactions"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    transaction_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )
    credit_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("carbon_credits.id"),
        nullable=False,
        index=True,
    )
    counterparty_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Transaction details
    amount_inr: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # sale, payment, refund
    status: Mapped[str] = mapped_column(String(50), nullable=False)  # pending, completed, failed

    # Payment details
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Timestamps
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Additional data
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    def __repr__(self) -> str:
        """String representation."""
        return f"Transaction(id={self.id}, code={self.transaction_code}, amount={self.amount_inr})"

    def mark_completed(self) -> None:
        """Mark transaction as completed."""
        self.status = "completed"
        self.processed_at = datetime.utcnow()

    def mark_failed(self, reason: str) -> None:
        """Mark transaction as failed."""
        self.status = "failed"
        self.metadata["failure_reason"] = reason
