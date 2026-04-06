"""Route models for stubble transportation."""
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
    from app.models.biogas_plant import BiogasPlant


class RouteStatus(str, PyEnum):
    """Status of a stubble collection route."""

    PLANNED = "planned"
    DISPATCHED = "dispatched"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Route(Base, TimestampMixin):
    """
    Route model for stubble collection from farms to biogas plants.

    Attributes:
        id: Unique identifier
        origin_farm_id: Source farm
        destination_plant_id: Destination biogas plant
        status: Current route status
        scheduled_at: When collection is scheduled
        completed_at: When collection was completed
        quantity_tons: Amount of stubble collected
        distance_km: Distance of route
        estimated_duration_min: Estimated travel time
        vehicle_number: Vehicle registration number
        driver_name: Name of driver
        driver_phone: Driver contact number
    """

    __tablename__ = "routes"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    route_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )
    origin_farm_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("farmers.id"),
        nullable=False,
        index=True,
    )
    destination_plant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("biogas_plants.id"),
        nullable=False,
        index=True,
    )

    # Route details
    status: Mapped[RouteStatus] = mapped_column(
        SQLEnum(RouteStatus),
        default=RouteStatus.PLANNED,
        nullable=False,
        index=True,
    )
    priority: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    # Schedule
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        index=True,
    )
    dispatched_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Collection details
    quantity_tons: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    collected_tons: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Route metrics (calculated by routing service)
    distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimated_duration_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actual_duration_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Cost calculation
    transport_cost_inr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stubble_payment_inr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_cost_inr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Vehicle details
    vehicle_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    driver_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    driver_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Route optimization data
    optimized_path: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    origin_farm: Mapped["Farmer"] = relationship(
        "Farmer",
        foreign_keys=[origin_farm_id],
        back_populates="origin_routes",
    )
    destination_plant: Mapped["BiogasPlant"] = relationship(
        "BiogasPlant",
        foreign_keys=[destination_plant_id],
        back_populates="destination_routes",
    )
    stops: Mapped[list["RouteStop"]] = relationship(
        "RouteStop",
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="RouteStop.sequence",
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"Route(id={self.id}, code={self.route_code}, status={self.status})"

    @property
    def is_dispatchable(self) -> bool:
        """Check if route can be dispatched."""
        return self.status == RouteStatus.PLANNED and self.scheduled_at is not None

    @property
    def completion_percentage(self) -> float:
        """Get route completion percentage."""
        if self.quantity_tons == 0:
            return 0.0
        return min(100.0, (self.collected_tons / self.quantity_tons) * 100)

    def calculate_total_cost(self, transport_rate_per_km: float = 15.0) -> None:
        """Calculate total cost of route."""
        if self.distance_km:
            self.transport_cost_inr = self.distance_km * transport_rate_per_km

        # Stubble payment (quantity * plant's per-ton rate)
        # This will be set from plant data
        self.total_cost_inr = (self.transport_cost_inr or 0) + (self.stubble_payment_inr or 0)

    def mark_dispatched(self, vehicle_number: str, driver_name: str, driver_phone: str) -> None:
        """Mark route as dispatched."""
        self.status = RouteStatus.DISPATCHED
        self.dispatched_at = datetime.utcnow()
        self.vehicle_number = vehicle_number
        self.driver_name = driver_name
        self.driver_phone = driver_phone

    def mark_completed(self, collected_tons: float) -> None:
        """Mark route as completed."""
        self.status = RouteStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        self.collected_tons = collected_tons
        if collected_tons > 0 and self.completed_at and self.dispatched_at:
            duration = self.completed_at - self.dispatched_at
            self.actual_duration_min = int(duration.total_seconds() / 60)


class RouteStop(Base, TimestampMixin):
    """
    Route stop model for multi-stop routes.

    Allows routes to include multiple farms in a single trip.
    """

    __tablename__ = "route_stops"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    route_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("routes.id"),
        nullable=False,
        index=True,
    )
    farmer_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("farmers.id"),
        nullable=False,
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)

    # Stop details
    planned_quantity_tons: Mapped[float] = mapped_column(Float, nullable=False)
    collected_quantity_tons: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    arrival_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    departure_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    # Relationships
    route: Mapped["Route"] = relationship("Route", back_populates="stops")

    def __repr__(self) -> str:
        """String representation."""
        return f"RouteStop(id={self.id}, sequence={self.sequence})"

    @property
    def is_completed(self) -> bool:
        """Check if stop is completed."""
        return self.departure_at is not None
