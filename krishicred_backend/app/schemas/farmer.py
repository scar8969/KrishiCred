"""Pydantic schemas for Farmer operations."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.models.farmer import Language


class FarmerBase(BaseModel):
    """Base farmer schema."""

    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    language: Language = Language.PUNJABI
    village: str = Field(..., min_length=1, max_length=255)
    district: str = Field(..., min_length=1, max_length=100)
    state: str = Field(default="Punjab", max_length=50)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    farm_area_hectares: float = Field(..., ge=0)
    expected_stubble_tons: float = Field(default=0.0, ge=0)
    whatsapp_opt_in: bool = True

    @validator("phone")
    def normalize_phone(cls, v: str) -> str:
        """Normalize phone number to E.164 format for India."""
        if not v.startswith("+"):
            if v.startswith("0"):
                v = "+91" + v[1:]
            else:
                v = "+91" + v
        return v


class FarmerCreate(FarmerBase):
    """Schema for creating a new farmer."""

    pass


class FarmerUpdate(BaseModel):
    """Schema for updating farmer details."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    language: Optional[Language] = None
    village: Optional[str] = Field(None, min_length=1, max_length=255)
    district: Optional[str] = Field(None, min_length=1, max_length=100)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    farm_area_hectares: Optional[float] = Field(None, ge=0)
    expected_stubble_tons: Optional[float] = Field(None, ge=0)
    whatsapp_opt_in: Optional[bool] = None
    verified: Optional[bool] = None
    active: Optional[bool] = None


class FarmerInDB(FarmerBase):
    """Schema for farmer as stored in database."""

    id: UUID
    verified: bool
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class FarmerResponse(FarmerInDB):
    """Schema for farmer API response."""

    full_address: str
    display_name: str
    has_coordinates: bool


class FarmerListResponse(BaseModel):
    """Schema for paginated farmer list."""

    items: list[FarmerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class FarmerLocation(BaseModel):
    """Schema for farmer location."""

    latitude: float
    longitude: float
    address: Optional[str] = None


class NearbyFarmersQuery(BaseModel):
    """Schema for finding nearby farmers."""

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: int = Field(default=10, ge=1, le=100)
    min_stubble_tons: Optional[float] = Field(None, ge=0)


class FarmerStatsResponse(BaseModel):
    """Schema for farmer statistics."""

    total_farmers: int
    active_farmers: int
    verified_farmers: int
    total_farm_area_hectares: float
    total_expected_stubble_tons: float
    whatsapp_opted_in: int
    by_district: dict[str, int]
