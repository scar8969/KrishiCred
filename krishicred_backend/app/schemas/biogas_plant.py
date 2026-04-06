"""Pydantic schemas for Biogas Plant operations."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.models.biogas_plant import PlantStatus


class BiogasPlantBase(BaseModel):
    """Base biogas plant schema."""

    name: str = Field(..., min_length=1, max_length=255)
    operator: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1, max_length=100)
    state: str = Field(default="Punjab", max_length=50)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    capacity_tons_per_day: float = Field(..., ge=1.0)
    max_storage_tons: float = Field(default=200.0, ge=10.0)
    contact_person: str = Field(..., min_length=1, max_length=255)
    contact_phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    contact_email: Optional[str] = Field(None, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    price_per_ton: float = Field(default=500.0, ge=0)


class BiogasPlantCreate(BiogasPlantBase):
    """Schema for creating a new biogas plant."""

    status: PlantStatus = PlantStatus.ACTIVE


class BiogasPlantUpdate(BaseModel):
    """Schema for updating biogas plant details."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    operator: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, min_length=1)
    district: Optional[str] = Field(None, min_length=1, max_length=100)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    capacity_tons_per_day: Optional[float] = Field(None, ge=1.0)
    current_stock_tons: Optional[float] = Field(None, ge=0)
    max_storage_tons: Optional[float] = Field(None, ge=10.0)
    status: Optional[PlantStatus] = None
    contact_person: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    contact_email: Optional[str] = None
    price_per_ton: Optional[float] = Field(None, ge=0)


class BiogasPlantInDB(BiogasPlantBase):
    """Schema for biogas plant as stored in database."""

    id: UUID
    current_stock_tons: float
    status: PlantStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class BiogasPlantResponse(BiogasPlantInDB):
    """Schema for biogas plant API response."""

    available_capacity: float
    capacity_utilization_percent: float
    can_accept_stubble: bool


class BiogasPlantListResponse(BaseModel):
    """Schema for paginated biogas plant list."""

    items: list[BiogasPlantResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BiogasPlantStatsResponse(BaseModel):
    """Schema for biogas plant statistics."""

    total_plants: int
    active_plants: int
    total_capacity_tons_per_day: float
    current_stock_tons: float
    total_storage_capacity_tons: float
    average_utilization_percent: float
    by_district: dict[str, int]
    by_status: dict[str, int]
