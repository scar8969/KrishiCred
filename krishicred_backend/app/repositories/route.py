"""Repository for Route database operations."""
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.route import Route, RouteStop, RouteStatus
from app.schemas.route import RouteQueryParams


class RouteRepository:
    """Repository for Route model operations."""

    def __init__(self, db: AsyncSession):
        """Initialize repository with database session."""
        self.db = db

    async def get(self, route_id: UUID) -> Optional[Route]:
        """Get a route by ID with stops."""
        result = await self.db.execute(
            select(Route)
            .where(Route.id == route_id)
            .options(
                selectinload(Route.stops),
                selectinload(Route.farmer),
                selectinload(Route.plant),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        route_data: dict[str, Any],
        stops_data: Optional[list[dict[str, Any]]] = None,
    ) -> Route:
        """Create a new route with optional stops."""
        # Extract stops from data if present
        stops = route_data.pop("stops", None)

        route = Route(**route_data)
        self.db.add(route)
        await self.db.flush()

        # Create stops if provided
        if stops_data:
            for stop_data in stops_data:
                stop = RouteStop(route_id=route.id, **stop_data)
                self.db.add(stop)

        await self.db.commit()
        await self.db.refresh(route)
        return route

    async def update(
        self,
        route_id: UUID,
        update_data: dict[str, Any],
    ) -> Optional[Route]:
        """Update a route."""
        result = await self.db.execute(
            update(Route)
            .where(Route.id == route_id)
            .values(**update_data)
            .returning(Route)
        )
        await self.db.commit()

        route = result.scalar_one_or_none()
        if route:
            await self.db.refresh(route)
            # Reload with stops
            return await self.get(route_id)
        return route

    async def delete(self, route_id: UUID) -> bool:
        """Delete a route."""
        result = await self.db.execute(
            select(Route).where(Route.id == route_id)
        )
        route = result.scalar_one_or_none()

        if route:
            await self.db.delete(route)
            await self.db.commit()
            return True
        return False

    async def list_routes(
        self,
        page: int = 1,
        page_size: int = 20,
        params: Optional[RouteQueryParams] = None,
    ) -> tuple[list[Route], int]:
        """List routes with filtering and pagination."""
        params = params or RouteQueryParams()

        # Build base query
        query = select(Route).options(
            selectinload(Route.stops),
            selectinload(Route.farmer),
            selectinload(Route.plant),
        )

        # Apply filters
        if params.status:
            query = query.where(Route.status == params.status)
        if params.plant_id:
            query = query.where(Route.destination_plant_id == params.plant_id)
        if params.farmer_id:
            query = query.where(Route.origin_farm_id == params.farmer_id)
        if params.date_from:
            query = query.where(Route.created_at >= params.date_from)
        if params.date_to:
            query = query.where(Route.created_at <= params.date_to)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and ordering
        query = query.order_by(Route.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        routes = list(result.scalars().all())

        return routes, total

    async def get_stats(
        self,
        days: int = 30,
    ) -> dict[str, Any]:
        """Get route statistics for the specified period."""
        cutoff = datetime.utcnow() - timedelta(days=days)

        # Total routes
        total_result = await self.db.execute(
            select(func.count()).where(Route.created_at >= cutoff)
        )
        total_routes = total_result.scalar() or 0

        # Routes by status
        status_result = await self.db.execute(
            select(Route.status, func.count())
            .where(Route.created_at >= cutoff)
            .group_by(Route.status)
        )
        by_status = {status.value: count for status, count in status_result.all()}

        # Completed routes stats
        completed_result = await self.db.execute(
            select(
                func.count().label("count"),
                func.sum(Route.collected_tons).label("total_tons"),
                func.sum(Route.distance_km).label("total_distance"),
                func.avg(Route.actual_duration_min).label("avg_duration"),
            )
            .where(
                Route.created_at >= cutoff,
                Route.status == RouteStatus.COMPLETED,
            )
        )
        completed_stats = completed_result.one()

        # Routes by plant
        plant_result = await self.db.execute(
            select(Route.destination_plant_id, func.count())
            .where(Route.created_at >= cutoff)
            .group_by(Route.destination_plant_id)
        )
        by_plant = {str(plant_id): count for plant_id, count in plant_result.all()}

        return {
            "total_routes": total_routes,
            "active_routes": by_status.get(RouteStatus.ACTIVE.value, 0),
            "completed_routes": by_status.get(RouteStatus.COMPLETED.value, 0),
            "total_stubble_collected_tons": float(completed_stats.total_tons or 0),
            "total_distance_km": float(completed_stats.total_distance or 0),
            "average_completion_time_min": float(completed_stats.avg_duration or 0),
            "by_status": by_status,
            "by_plant": by_plant,
        }

    async def get_active_routes(
        self,
        plant_id: Optional[UUID] = None,
    ) -> list[Route]:
        """Get all active routes."""
        query = select(Route).where(
            Route.status.in_([
                RouteStatus.PENDING,
                RouteStatus.ACTIVE,
            ])
        ).options(
            selectinload(Route.stops),
            selectinload(Route.farmer),
            selectinload(Route.plant),
        )

        if plant_id:
            query = query.where(Route.destination_plant_id == plant_id)

        query = query.order_by(Route.scheduled_at.asc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_plant(
        self,
        plant_id: UUID,
        status: Optional[RouteStatus] = None,
        limit: int = 50,
    ) -> list[Route]:
        """Get routes for a specific plant."""
        query = select(Route).where(Route.destination_plant_id == plant_id)

        if status:
            query = query.where(Route.status == status)

        query = query.options(
            selectinload(Route.stops),
            selectinload(Route.farmer),
            selectinload(Route.plant),
        )
        query = query.order_by(Route.created_at.desc()).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_farmer(
        self,
        farmer_id: UUID,
        status: Optional[RouteStatus] = None,
        limit: int = 50,
    ) -> list[Route]:
        """Get routes for a specific farmer."""
        query = select(Route).where(Route.origin_farm_id == farmer_id)

        if status:
            query = query.where(Route.status == status)

        query = query.options(
            selectinload(Route.stops),
            selectinload(Route.farmer),
            selectinload(Route.plant),
        )
        query = query.order_by(Route.created_at.desc()).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def add_stop(
        self,
        route_id: UUID,
        stop_data: dict[str, Any],
    ) -> RouteStop:
        """Add a stop to a route."""
        stop = RouteStop(route_id=route_id, **stop_data)
        self.db.add(stop)
        await self.db.commit()
        await self.db.refresh(stop)
        return stop

    async def update_stop(
        self,
        stop_id: UUID,
        update_data: dict[str, Any],
    ) -> Optional[RouteStop]:
        """Update a route stop."""
        result = await self.db.execute(
            update(RouteStop)
            .where(RouteStop.id == stop_id)
            .values(**update_data)
            .returning(RouteStop)
        )
        await self.db.commit()

        stop = result.scalar_one_or_none()
        if stop:
            await self.db.refresh(stop)
        return stop
