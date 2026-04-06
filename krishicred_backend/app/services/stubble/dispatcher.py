"""Route dispatch and management service."""
import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import get_logger
from app.models.biogas_plant import BiogasPlant
from app.models.farmer import Farmer
from app.models.route import Route, RouteStatus
from app.schemas.route import RouteCreate, RouteUpdate

logger = get_logger(__name__)


class RouteDispatcher:
    """
    Service for dispatching and managing collection routes.

    Handles route lifecycle from planning to completion.
    """

    def __init__(self, db: AsyncSession):
        """Initialize dispatcher with database session."""
        self.db = db

    async def create_route(self, route_data: RouteCreate) -> Route:
        """
        Create a new collection route.

        Args:
            route_data: Route creation data

        Returns:
            Created Route instance
        """
        # Validate farm and plant exist
        await self.validate_route_data(route_data)

        # Generate route code
        from app.services.stubble.optimizer import RouteOptimizer
        optimizer = RouteOptimizer(self.db)
        route_code = optimizer._generate_route_code()

        # Create route
        route = Route(
            route_code=route_code,
            origin_farm_id=route_data.origin_farm_id,
            destination_plant_id=route_data.destination_plant_id,
            quantity_tons=route_data.quantity_tons,
            priority=route_data.priority,
            scheduled_at=route_data.scheduled_at,
            status=RouteStatus.PLANNED,
        )

        self.db.add(route)
        await self.db.commit()
        await self.db.refresh(route)

        # Create stops if provided
        if route_data.stops:
            for stop_data in route_data.stops:
                from app.models.route import RouteStop
                stop = RouteStop(
                    route_id=route.id,
                    farmer_id=stop_data.farmer_id,
                    sequence=stop_data.sequence,
                    planned_quantity_tons=stop_data.planned_quantity_tons,
                )
                self.db.add(stop)

            await self.db.commit()

        logger.info(f"Created route {route.route_code}")
        return route

    async def validate_route_data(self, route_data: RouteCreate) -> None:
        """Validate route data (farm, plant, quantities)."""
        # Check farm exists
        farm_result = await self.db.execute(
            select(Farmer).where(Farmer.id == route_data.origin_farm_id)
        )
        farm = farm_result.scalar_one_or_none()
        if not farm:
            raise ValidationException("Farm not found", "origin_farm_id")

        # Check plant exists
        plant_result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == route_data.destination_plant_id)
        )
        plant = plant_result.scalar_one_or_none()
        if not plant:
            raise ValidationException("Plant not found", "destination_plant_id")

        # Check plant has capacity
        if not plant.can_accept_stubble:
            raise ValidationException(
                f"Plant {plant.name} is at capacity",
                "destination_plant_id"
            )

        # Validate quantity
        if route_data.quantity_tons > plant.available_capacity:
            raise ValidationException(
                f"Quantity exceeds plant's available capacity of {plant.available_capacity} tons",
                "quantity_tons"
            )

    async def dispatch(
        self,
        route_id: UUID,
        vehicle_number: str,
        driver_name: str,
        driver_phone: str,
    ) -> Route:
        """
        Dispatch a route for collection.

        Assigns vehicle and driver, marks route as dispatched.
        """
        result = await self.db.execute(
            select(Route)
            .options(selectinload(Route.origin_farm))
            .options(selectinload(Route.destination_plant))
            .where(Route.id == route_id)
        )
        route = result.scalar_one_or_none()

        if not route:
            raise NotFoundException("Route", str(route_id))

        if not route.is_dispatchable:
            raise ValidationException(
                f"Route {route.route_code} cannot be dispatched (status: {route.status})",
                "status"
            )

        # Mark as dispatched
        route.mark_dispatched(vehicle_number, driver_name, driver_phone)
        await self.db.commit()
        await self.db.refresh(route)

        logger.info(
            f"Dispatched route {route.route_code} "
            f"(vehicle: {vehicle_number}, driver: {driver_name})"
        )

        # Send notifications
        await self._send_dispatch_notifications(route)

        return route

    async def complete(
        self,
        route_id: UUID,
        collected_tons: float,
        notes: Optional[str] = None,
    ) -> Route:
        """
        Mark route as completed.

        Records actual collection amount and updates plant stock.
        """
        result = await self.db.execute(
            select(Route)
            .options(selectinload(Route.destination_plant))
            .where(Route.id == route_id)
        )
        route = result.scalar_one_or_none()

        if not route:
            raise NotFoundException("Route", str(route_id))

        if route.status != RouteStatus.DISPATCHED:
            raise ValidationException(
                f"Route {route.route_code} is not dispatched (status: {route.status})",
                "status"
            )

        # Mark as completed
        route.mark_completed(collected_tons)
        if notes:
            route.metadata["completion_notes"] = notes

        # Update plant stock
        try:
            route.destination_plant.add_stock(collected_tons)
        except ValueError as e:
            logger.warning(f"Could not update plant stock: {e}")

        await self.db.commit()
        await self.db.refresh(route)

        logger.info(
            f"Completed route {route.route_code}: "
            f"{collected_tons}/{route.quantity_tons} tons collected"
        )

        # Trigger credit calculation
        await self._trigger_credit_calculation(route)

        return route

    async def cancel(self, route_id: UUID, reason: Optional[str] = None) -> Route:
        """Cancel a planned route."""
        result = await self.db.execute(
            select(Route).where(Route.id == route_id)
        )
        route = result.scalar_one_or_none()

        if not route:
            raise NotFoundException("Route", str(route_id))

        if route.status not in (RouteStatus.PLANNED, RouteStatus.DISPATCHED):
            raise ValidationException(
                f"Cannot cancel route with status {route.status}",
                "status"
            )

        route.status = RouteStatus.CANCELLED
        if reason:
            route.metadata["cancellation_reason"] = reason

        await self.db.commit()
        await self.db.refresh(route)

        logger.info(f"Cancelled route {route.route_code}: {reason}")

        return route

    async def _send_dispatch_notifications(self, route: Route) -> None:
        """Send notifications when route is dispatched."""
        from app.utils.whatsapp import WhatsAppClient

        whatsapp = WhatsAppClient()

        # Notify farmer
        if route.origin_farm and route.origin_farm.whatsapp_opt_in:
            try:
                await whatsapp.send_route_dispatched(
                    phone_number=route.origin_farm.phone,
                    farmer_name=route.origin_farm.name,
                    scheduled_time=route.scheduled_at,
                    vehicle_number=route.vehicle_number,
                    driver_name=route.driver_name,
                    driver_phone=route.driver_phone,
                )
            except Exception as e:
                logger.error(f"Failed to notify farmer: {e}")

        # Notify plant
        if route.destination_plant:
            try:
                await whatsapp.send_incoming_collection(
                    phone_number=route.destination_plant.contact_phone,
                    plant_name=route.destination_plant.name,
                    farmer_name=route.origin_farm.name if route.origin_farm else "Unknown",
                    quantity_tons=route.quantity_tons,
                    eta_minutes=route.estimated_duration_min,
                )
            except Exception as e:
                logger.error(f"Failed to notify plant: {e}")

    async def _trigger_credit_calculation(self, route: Route) -> None:
        """Trigger carbon credit calculation for completed route."""
        from app.tasks.carbon_tasks import process_pending_credits

        # Trigger background task
        process_pending_credits.delay()

        logger.info(f"Triggered credit calculation for route {route.route_code}")

    async def get_overdue_routes(self, hours: int = 24) -> list[Route]:
        """Get routes that are overdue for completion."""
        from datetime import datetime, timedelta

        cutoff = datetime.utcnow() - timedelta(hours=hours)

        result = await self.db.execute(
            select(Route)
            .where(Route.status == RouteStatus.DISPATCHED)
            .where(Route.scheduled_at < cutoff)
        )

        return list(result.scalars().all())

    async def get_pending_routes(self, plant_id: Optional[UUID] = None) -> list[Route]:
        """Get routes pending dispatch or collection."""
        query = select(Route).where(
            Route.status.in_([RouteStatus.PLANNED, RouteStatus.DISPATCHED])
        )

        if plant_id:
            query = query.where(Route.destination_plant_id == plant_id)

        result = await self.db.execute(query.order_by(Route.scheduled_at))
        return list(result.scalars().all())
