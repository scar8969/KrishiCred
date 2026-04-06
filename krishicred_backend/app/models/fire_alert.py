"""Fire alert model for crop residue burning detection."""
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
    from app.models.farmer import Farmer


class AlertStatus(str, PyEnum):
    """Status of a fire alert."""

    DETECTED = "detected"
    ALERTING = "alerting"
    RESPONDED = "responded"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class AlertSource(str, PyEnum):
    """Source of fire detection."""

    MODIS = "MODIS"
    VIIRS = "VIIRS"
    GROUND_REPORT = "ground_report"


class FireAlert(Base, TimestampMixin):
    """
    Fire alert model representing detected crop residue burning events.

    Attributes:
        id: Unique identifier
        location: Geo location of fire (PostGIS point)
        detection_time: When the fire was detected by satellite
        confidence: Detection confidence percentage
        brightness: Fire brightness temperature (Kelvin)
        power: Radiative power (MW)
        source: Satellite source (MODIS/VIIRS)
        status: Current alert status
        alert_sent: Whether WhatsApp alert was sent
        alert_sent_at: When alert was sent
        affected_farmers: List of farmers near the fire
    """

    __tablename__ = "fire_alerts"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    satellite_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    source: Mapped[AlertSource] = mapped_column(
        SQLEnum(AlertSource),
        nullable=False,
        index=True,
    )
    detection_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Fire characteristics
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    brightness: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    power: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Pixel information
    pixel_size_km: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    scan: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    track: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Alert management
    status: Mapped[AlertStatus] = mapped_column(
        SQLEnum(AlertStatus),
        default=AlertStatus.DETECTED,
        nullable=False,
        index=True,
    )
    alert_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    alert_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    farmers_alerted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Response tracking
    response_received: Mapped[bool] = mapped_column(Boolean, default=False)
    response_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Associated farmer (if match found)
    farmer_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("farmers.id"),
        nullable=True,
        index=True,
    )

    # Additional satellite and processing data
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    farmer: Mapped[Optional["Farmer"]] = relationship(
        "Farmer",
        back_populates="fire_alerts",
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"FireAlert(id={self.id}, source={self.source}, confidence={self.confidence}%)"

    @property
    def is_recent(self) -> bool:
        """Check if alert is from last 24 hours."""
        return (datetime.utcnow() - self.detection_time).days < 1

    @property
    def high_confidence(self) -> bool:
        """Check if detection is high confidence."""
        return self.confidence >= 80.0

    @property
    def requires_alert(self) -> bool:
        """Check if alert should be sent to farmers."""
        return (
            self.status == AlertStatus.DETECTED
            and not self.alert_sent
            and self.high_confidence
        )

    def mark_alert_sent(self, farmers_count: int) -> None:
        """Mark alert as sent to farmers."""
        self.alert_sent = True
        self.alert_sent_at = datetime.utcnow()
        self.farmers_alerted = farmers_count
        self.status = AlertStatus.ALERTING

    def mark_resolved(self) -> None:
        """Mark alert as resolved (farmer responded)."""
        self.status = AlertStatus.RESOLVED
        self.response_received = True
        self.response_at = datetime.utcnow()
        self.resolved_at = datetime.utcnow()

    def mark_false_positive(self) -> None:
        """Mark alert as false positive."""
        self.status = AlertStatus.FALSE_POSITIVE
        self.resolved_at = datetime.utcnow()
