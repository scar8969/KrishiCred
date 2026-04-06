"""Pydantic schemas for Fire Alert operations."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.models.fire_alert import AlertSource, AlertStatus


class FireAlertBase(BaseModel):
    """Base fire alert schema."""

    satellite_id: str = Field(..., max_length=100)
    source: AlertSource
    detection_time: datetime
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    confidence: float = Field(..., ge=0, le=100)
    brightness: Optional[float] = Field(None, ge=0)
    power: Optional[float] = Field(None, ge=0)
    pixel_size_km: float = Field(default=1.0, ge=0)
    scan: Optional[float] = None
    track: Optional[float] = None


class FireAlertCreate(FireAlertBase):
    """Schema for creating a fire alert (from satellite processing)."""

    metadata: Optional[dict] = None


class FireAlertUpdate(BaseModel):
    """Schema for updating fire alert status."""

    status: Optional[AlertStatus] = None
    farmer_id: Optional[UUID] = None


class FireAlertInDB(FireAlertBase):
    """Schema for fire alert as stored in database."""

    id: UUID
    status: AlertStatus
    alert_sent: bool
    alert_sent_at: Optional[datetime]
    farmers_alerted: int
    response_received: bool
    response_at: Optional[datetime]
    resolved_at: Optional[datetime]
    farmer_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class FireAlertResponse(FireAlertInDB):
    """Schema for fire alert API response."""

    is_recent: bool
    high_confidence: bool
    requires_alert: bool


class FireAlertListResponse(BaseModel):
    """Schema for paginated fire alert list."""

    items: list[FireAlertResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class FireAlertStatsResponse(BaseModel):
    """Schema for fire alert statistics."""

    total_alerts: int
    alerts_today: int
    alerts_this_week: int
    high_confidence_alerts: int
    alerts_sent: int
    farmers_alerted: int
    resolved_alerts: int
    false_positives: int
    by_source: dict[str, int]
    by_status: dict[str, int]


class FireAlertQueryParams(BaseModel):
    """Schema for fire alert query parameters."""

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_confidence: Optional[float] = Field(None, ge=0, le=100)
    source: Optional[AlertSource] = None
    status: Optional[AlertStatus] = None
    farmer_id: Optional[UUID] = None
    has_response: Optional[bool] = None


class AlertResponse(BaseModel):
    """Schema for farmer alert response."""

    farmer_id: UUID
    alert_id: UUID
    response_type: str = Field(..., pattern=r"^(will_not_burn|already_burned|false_alarm)$")
    notes: Optional[str] = Field(None, max_length=1000)
    responded_at: datetime = Field(default_factory=datetime.utcnow)


class WhatsAppAlertMessage(BaseModel):
    """Schema for WhatsApp alert message content."""

    alert_id: UUID
    farmer_id: UUID
    farmer_name: str
    farmer_language: str
    alert_location: str
    detection_time: datetime
    message_template: str = "fire_alert_v1"
    template_params: dict[str, str]
