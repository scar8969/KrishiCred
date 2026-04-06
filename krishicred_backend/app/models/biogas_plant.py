"""Biogas plant model for stubble processing facilities."""
from enum import Enum as PyEnum
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Float,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.route import Route
    from app.models.carbon_credit import CarbonCredit


class PlantStatus(str, PyEnum):
    """Operational status of biogas plant."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    UNDER_CONSTRUCTION = "under_construction"


class BiogasPlant(Base, TimestampMixin):
    """
    Biogas plant model representing stubble processing facilities.

    Attributes:
        id: Unique identifier
        name: Plant name
        operator: Operating company name
        address: Full address
        location: Geo location (PostGIS point)
        capacity_tons_per_day: Daily processing capacity
        current_capacity utilization
        status: Operating status
        contact_person: Name of contact person
        contact_phone: Phone number
    """

    __tablename__ = "biogas_plants"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    operator: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), default="Punjab", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Capacity and utilization
    capacity_tons_per_day: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=50.0,
    )
    current_stock_tons: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    max_storage_tons: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=200.0,
    )

    # Operational status
    status: Mapped[PlantStatus] = mapped_column(
        SQLEnum(PlantStatus),
        default=PlantStatus.ACTIVE,
        nullable=False,
    )

    # Contact information
    contact_person: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Pricing (INR per ton of stubble)
    price_per_ton: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=500.0,
    )

    # Additional metadata
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    destination_routes: Mapped[list["Route"]] = relationship(
        "Route",
        foreign_keys="Route.destination_plant_id",
        back_populates="destination_plant",
        cascade="all, delete-orphan",
    )
    carbon_credits: Mapped[list["CarbonCredit"]] = relationship(
        "CarbonCredit",
        back_populates="plant",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"BiogasPlant(id={self.id}, name={self.name}, capacity={self.capacity_tons_per_day})"

    @property
    def available_capacity(self) -> float:
        """Get available storage capacity."""
        return max(0, self.max_storage_tons - self.current_stock_tons)

    @property
    def capacity_utilization_percent(self) -> float:
        """Get capacity utilization percentage."""
        if self.max_storage_tons == 0:
            return 0.0
        return (self.current_stock_tons / self.max_storage_tons) * 100

    @property
    def can_accept_stubble(self) -> bool:
        """Check if plant can accept more stubble."""
        return (
            self.status == PlantStatus.ACTIVE
            and self.available_capacity > 0
        )

    def add_stock(self, tons: float) -> None:
        """Add stubble to plant stock."""
        if tons > self.available_capacity:
            raise ValueError(
                f"Cannot add {tons} tons. Only {self.available_capacity} tons available."
            )
        self.current_stock_tons += tons

    def remove_stock(self, tons: float) -> None:
        """Remove stubble from plant stock (processed)."""
        if tons > self.current_stock_tons:
            raise ValueError(
                f"Cannot remove {tons} tons. Only {self.current_stock_tons} tons available."
            )
        self.current_stock_tons -= tons
