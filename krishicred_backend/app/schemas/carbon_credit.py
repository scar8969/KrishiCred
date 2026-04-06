"""Pydantic schemas for Carbon Credit operations."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.carbon_credit import CreditStatus, VerificationLevel


class CarbonCreditBase(BaseModel):
    """Base carbon credit schema."""

    plant_id: UUID
    route_id: Optional[UUID] = None
    stubble_tons: float = Field(..., ge=0)


class CarbonCreditCreate(CarbonCreditBase):
    """Schema for creating a carbon credit."""

    co2e_averted_tons: Optional[float] = Field(None, ge=0)
    credit_amount: Optional[float] = Field(None, ge=0)


class CarbonCreditUpdate(BaseModel):
    """Schema for updating carbon credit."""

    status: Optional[CreditStatus] = None
    verification_level: Optional[VerificationLevel] = None


class CarbonCreditInDB(CarbonCreditBase):
    """Schema for carbon credit as stored in database."""

    id: UUID
    credit_code: str
    co2e_averted_tons: float
    credit_amount: float
    status: CreditStatus
    verification_level: VerificationLevel
    verification_date: Optional[datetime]
    verified_by: Optional[str]
    certificate_id: Optional[str]
    certificate_url: Optional[str]
    expiry_date: Optional[datetime]
    price_per_ton: Optional[float]
    total_value_inr: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class CarbonCreditResponse(CarbonCreditInDB):
    """Schema for carbon credit API response."""

    is_verifiable: bool
    is_sellable: bool


class CarbonCreditListResponse(BaseModel):
    """Schema for paginated carbon credit list."""

    items: list[CarbonCreditResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CarbonCreditCalculation(BaseModel):
    """Schema for carbon credit calculation request."""

    stubble_tons: float = Field(..., ge=0.1)
    co2e_per_ton: float = Field(default=2.5, ge=1.0, le=5.0)
    conversion_efficiency: float = Field(default=0.95, ge=0.5, le=1.0)


class CarbonCreditCalculationResponse(BaseModel):
    """Schema for carbon credit calculation response."""

    stubble_tons: float
    co2e_averted_tons: float
    credit_amount: float
    estimated_value_inr: float


class CreditVerificationRequest(BaseModel):
    """Schema for credit verification request."""

    verification_level: VerificationLevel
    verifier_name: str
    verifier_id: str
    notes: Optional[str] = None


class CreditCertificationRequest(BaseModel):
    """Schema for credit certification request."""

    certificate_id: str
    certificate_url: str
    expiry_years: int = Field(default=5, ge=1, le=10)


class CreditSaleRequest(BaseModel):
    """Schema for selling carbon credits."""

    price_per_ton: float = Field(..., ge=100)
    buyer_name: str
    buyer_id: str
    payment_method: str = "bank_transfer"


class CreditSaleResponse(BaseModel):
    """Schema for credit sale response."""

    credit_id: UUID
    transaction_id: UUID
    amount_inr: float
    status: str


class TransactionBase(BaseModel):
    """Base transaction schema."""

    credit_id: UUID
    amount_inr: float = Field(..., ge=0)
    type: str = Field(..., pattern=r"^(sale|payment|refund)$")


class TransactionInDB(TransactionBase):
    """Schema for transaction as stored in database."""

    id: UUID
    transaction_code: str
    counterparty_id: Optional[str]
    status: str
    payment_method: Optional[str]
    payment_reference: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class TransactionResponse(TransactionInDB):
    """Schema for transaction API response."""

    pass


class CarbonCreditStatsResponse(BaseModel):
    """Schema for carbon credit statistics."""

    total_credits: int
    pending_credits: int
    verified_credits: int
    certified_credits: int
    sold_credits: int
    total_credits_tons: float
    total_value_inr: float
    average_price_per_ton: float
    by_status: dict[str, int]
    by_plant: dict[str, dict]
    monthly_totals: dict[str, float]


class CreditQueryParams(BaseModel):
    """Schema for credit query parameters."""

    status: Optional[CreditStatus] = None
    plant_id: Optional[UUID] = None
    verification_level: Optional[VerificationLevel] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
