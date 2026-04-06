"""Farmer model representing agricultural producers."""
from datetime import datetime
from enum import Enum as PyEnum
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
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.fire_alert import FireAlert
    from app.models.route import Route


class Language(str, PyEnum):
    """Supported languages for farmer communication."""

    PUNJABI = "pa"
    HINDI = "hi"
    ENGLISH = "en"


class Farmer(Base, TimestampMixin):
    """
    Farmer model representing individual farmers.

    Attributes:
        id: Unique identifier
        name: Farmer's full name
        phone: WhatsApp phone number
        language: Preferred language for alerts
        village: Village name
        district: District name
        state: State (default Punjab)
        location: Geo location of farm (PostGIS point)
        farm_area_hectares: Total farm area in hectares
        expected_stubble_tons: Expected stubble available in tons
        verified: Whether farmer details are verified
        active: Whether farmer is active in the system
    """

    __tablename__ = "farmers"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
        index=True,
    )
    language: Mapped[Language] = mapped_column(
        SQLEnum(Language),
        default=Language.PUNJABI,
        nullable=False,
    )
    village: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), default="Punjab", nullable=False)
    # PostGIS geometry column - will be added in migration
    # location: Mapped[Optional[object]]  # Geometry(Point, 4326)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    farm_area_hectares: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    expected_stubble_tons: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    whatsapp_opt_in: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Additional metadata stored as JSON
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    fire_alerts: Mapped[list["FireAlert"]] = relationship(
        "FireAlert",
        back_populates="farmer",
        cascade="all, delete-orphan",
    )
    origin_routes: Mapped[list["Route"]] = relationship(
        "Route",
        foreign_keys="Route.origin_farm_id",
        back_populates="origin_farm",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"Farmer(id={self.id}, name={self.name}, phone={self.phone})"

    @property
    def full_address(self) -> str:
        """Get full address string."""
        return f"{self.village}, {self.district}, {self.state}"

    @property
    def display_name(self) -> str:
        """Get display name for UI."""
        return f"{self.name} ({self.village})"

    def has_coordinates(self) -> bool:
        """Check if farmer has valid coordinates."""
        return self.latitude is not None and self.longitude is not None

    def update_stubble_estimate(self, area_hectares: float) -> None:
        """
        Update stubble estimate based on farm area.

        Formula: Approximately 5-8 tons of stubble per hectare
        depending on crop type and yield.
        """
        # Conservative estimate: 5 tons per hectare
        self.farm_area_hectares = area_hectares
        self.expected_stubble_tons = area_hectares * 5.0
