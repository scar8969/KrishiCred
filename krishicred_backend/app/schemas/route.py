"""Pydantic schemas for Route operations."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.route import RouteStatus


class RouteStopCreate(BaseModel):
    """Schema for creating a route stop."""

    farmer_id: UUID
    sequence: int = Field(..., ge=1)
    planned_quantity_tons: float = Field(..., ge=0)


class RouteStopInDB(BaseModel):
    """Schema for route stop as stored in database."""

    id: UUID
    farmer_id: UUID
    sequence: int
    planned_quantity_tons: float
    collected_quantity_tons: float
    arrival_at: Optional[datetime]
    departure_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        """Pydantic config."""

        from_attributes = True


class RouteBase(BaseModel):
    """Base route schema."""

    origin_farm_id: UUID
    destination_plant_id: UUID
    quantity_tons: float = Field(..., ge=0)
    priority: int = Field(default=5, ge=1, le=10)
    scheduled_at: Optional[datetime] = None


class RouteCreate(RouteBase):
    """Schema for creating a new route."""

    stops: Optional[list[RouteStopCreate]] = None


class RouteUpdate(BaseModel):
    """Schema for updating route."""

    status: Optional[RouteStatus] = None
    priority: Optional[int] = Field(None, ge=1, le=10)
    scheduled_at: Optional[datetime] = None
    quantity_tons: Optional[float] = Field(None, ge=0)
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None


class RouteDispatch(BaseModel):
    """Schema for dispatching a route."""

    vehicle_number: str = Field(..., min_length=1, max_length=20)
    driver_name: str = Field(..., min_length=1, max_length=255)
    driver_phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")


class RouteCompletion(BaseModel):
    """Schema for completing a route."""

    collected_tons: float = Field(..., ge=0)
    notes: Optional[str] = None


class RouteInDB(RouteBase):
    """Schema for route as stored in database."""

    id: UUID
    route_code: str
    status: RouteStatus
    dispatched_at: Optional[datetime]
    completed_at: Optional[datetime]
    collected_tons: float
    distance_km: Optional[float]
    estimated_duration_min: Optional[int]
    actual_duration_min: Optional[int]
    transport_cost_inr: Optional[float]
    stubble_payment_inr: Optional[float]
    total_cost_inr: Optional[float]
    vehicle_number: Optional[str]
    driver_name: Optional[str]
    driver_phone: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class RouteResponse(RouteInDB):
    """Schema for route API response."""

    stops: list[RouteStopInDB]
    is_dispatchable: bool
    completion_percentage: float


class RouteListResponse(BaseModel):
    """Schema for paginated route list."""

    items: list[RouteResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RouteOptimizationRequest(BaseModel):
    """Schema for route optimization request."""

    plant_id: UUID
    max_distance_km: int = Field(default=50, ge=10, le=100)
    min_stubble_tons: float = Field(default=2.0, ge=0.5)
    max_routes: int = Field(default=10, ge=1, le=50)
    vehicle_capacity_tons: float = Field(default=5.0, ge=1.0, le=20.0)


class RouteOptimizationResponse(BaseModel):
    """Schema for route optimization response."""

    optimization_id: str
    total_farmers: int
    total_stubble_tons: float
    routes_created: int
    estimated_collections_tons: float
    routes: list[RouteResponse]
    optimization_metadata: dict


class RouteStatsResponse(BaseModel):
    """Schema for route statistics."""

    total_routes: int
    active_routes: int
    completed_routes: int
    total_stubble_collected_tons: float
    total_distance_km: float
    average_completion_time_min: float
    by_status: dict[str, int]
    by_plant: dict[str, int]


class RouteQueryParams(BaseModel):
    """Schema for route query parameters."""

    status: Optional[RouteStatus] = None
    plant_id: Optional[UUID] = None
    farmer_id: Optional[UUID] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
