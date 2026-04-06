"""Route optimization service using VRP solver."""
import logging
import random
import string
from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import RoutingException
from app.core.logging import get_logger
from app.models.biogas_plant import BiogasPlant
from app.models.farmer import Farmer
from app.models.route import Route, RouteStop, RouteStatus
from app.schemas.route import RouteCreate

settings = get_settings()
logger = get_logger(__name__)


class RouteOptimizer:
    """
    Service for optimizing stubble collection routes.

    Uses Vehicle Routing Problem (VRP) algorithms to create
    optimal multi-stop routes for biogas plants.
    """

    def __init__(self, db: AsyncSession):
        """Initialize optimizer with database session."""
        self.db = db

    async def optimize_for_plant(
        self,
        plant_id: UUID,
        max_distance_km: int = 50,
        min_stubble_tons: float = 2.0,
        max_routes: int = 20,
        vehicle_capacity_tons: float = 10.0,
    ) -> dict[str, Any]:
        """
        Optimize collection routes for a biogas plant.

        Args:
            plant_id: UUID of the biogas plant
            max_distance_km: Maximum collection radius
            min_stubble_tons: Minimum stubble per farm to include
            max_routes: Maximum number of routes to create
            vehicle_capacity_tons: Vehicle capacity constraint

        Returns:
            Dict with optimization results and created routes
        """
        from app.services.stubble.matcher import FarmPlantMatcher
        from app.repositories.route import RouteRepository

        # Get plant
        plant_result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == plant_id)
        )
        plant = plant_result.scalar_one_or_none()

        if not plant:
            raise RoutingException(f"Plant {plant_id} not found")

        if not plant.can_accept_stubble:
            raise RoutingException(f"Plant {plant.name} is at capacity")

        # Get nearby farms with stubble
        matcher = FarmPlantMatcher(self.db)
        farms = await matcher.find_nearby_farms_with_stubble(
            plant_id=plant_id,
            radius_km=max_distance_km,
            min_stubble_tons=min_stubble_tons,
        )

        if not farms:
            logger.info(f"No farms found for plant {plant_id}")
            return {
                "optimization_id": self._generate_optimization_id(),
                "plant_id": str(plant_id),
                "total_farmers": 0,
                "total_stubble_tons": 0.0,
                "routes_created": 0,
                "estimated_collections_tons": 0.0,
                "routes": [],
            }

        # Run VRP solver
        routes = await self._solve_vrp(
            plant=plant,
            farms=farms,
            vehicle_capacity_tons=vehicle_capacity_tons,
            max_routes=max_routes,
        )

        # Create routes in database
        created_routes = []
        total_tons = 0.0

        for route_data in routes:
            try:
                route = await self._create_route_from_solution(route_data)
                created_routes.append(route)
                total_tons += route.quantity_tons
            except Exception as e:
                logger.error(f"Failed to create route: {e}")
                continue

        logger.info(
            f"Optimization complete for plant {plant_id}: "
            f"{len(created_routes)} routes, {total_tons} tons"
        )

        return {
            "optimization_id": self._generate_optimization_id(),
            "plant_id": str(plant_id),
            "total_farmers": len(farms),
            "total_stubble_tons": sum(f["expected_stubble_tons"] for f in farms),
            "routes_created": len(created_routes),
            "estimated_collections_tons": total_tons,
            "routes": created_routes,
            "metadata": {
                "plant_name": plant.name,
                "vehicle_capacity_tons": vehicle_capacity_tons,
                "max_distance_km": max_distance_km,
            },
        }

    async def _solve_vrp(
        self,
        plant: BiogasPlant,
        farms: list[dict],
        vehicle_capacity_tons: float,
        max_routes: int,
    ) -> list[dict]:
        """
        Solve Vehicle Routing Problem.

        Uses a simplified nearest-neighbor heuristic with capacity constraints.
        For production, consider using OR-Tools or similar.
        """
        routes = []
        unassigned_farms = farms.copy()
        route_count = 0

        while unassigned_farms and route_count < max_routes:
            route = {
                "plant_id": str(plant.id),
                "stops": [],
                "total_tons": 0.0,
                "total_distance_km": 0.0,
            }

            current_lat = plant.latitude
            current_lon = plant.longitude
            route_tons = 0.0
            route_distance = 0.0

            # Greedy nearest-neighbor with capacity constraint
            while unassigned_farms:
                # Find nearest farm
                nearest_idx = None
                nearest_dist = float("inf")

                for i, farm in enumerate(unassigned_farms):
                    # Check capacity
                    if route_tons + farm["expected_stubble_tons"] > vehicle_capacity_tons:
                        continue

                    # Calculate distance
                    dist = self._haversine_distance(
                        current_lat, current_lon,
                        farm["latitude"], farm["longitude"]
                    )

                    if dist < nearest_dist:
                        nearest_dist = dist
                        nearest_idx = i

                if nearest_idx is None:
                    # No more farms fit in this route
                    break

                # Add farm to route
                farm = unassigned_farms.pop(nearest_idx)
                route["stops"].append(farm)
                route_tons += farm["expected_stubble_tons"]
                route_distance += nearest_dist

                current_lat = farm["latitude"]
                current_lon = farm["longitude"]

            # Add return trip to plant
            if route["stops"]:
                route_distance += self._haversine_distance(
                    current_lat, current_lon,
                    plant.latitude, plant.longitude
                )

            if route["stops"]:
                route["total_tons"] = route_tons
                route["total_distance_km"] = route_distance
                routes.append(route)
                route_count += 1
            else:
                # No farms could be assigned
                break

        return routes

    def _haversine_distance(
        self,
        lat1: float, lon1: float,
        lat2: float, lon2: float,
    ) -> float:
        """Calculate distance between two points in km."""
        from math import radians, cos, sin, asin, sqrt

        lon1, lat1, lon2, lat2 = map(
            radians, [lon1, lat1, lon2, lat2]
        )

        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))

        return 6371 * c

    async def _create_route_from_solution(self, route_data: dict) -> Route:
        """Create route record from optimization solution."""
        # Generate route code
        route_code = self._generate_route_code()

        # Create route
        route = Route(
            route_code=route_code,
            origin_farm_id=UUID(route_data["stops"][0]["id"]),
            destination_plant_id=UUID(route_data["plant_id"]),
            quantity_tons=route_data["total_tons"],
            distance_km=route_data["total_distance_km"],
            estimated_duration_min=int(route_data["total_distance_km"] * 2),  # ~30km/h avg
            status=RouteStatus.PLANNED,
            priority=5,
        )

        self.db.add(route)
        await self.db.flush()

        # Create stops (for multi-stop routes)
        for idx, stop_data in enumerate(route_data["stops"]):
            stop = RouteStop(
                route_id=route.id,
                farmer_id=UUID(stop_data["id"]),
                sequence=idx + 1,
                planned_quantity_tons=stop_data["expected_stubble_tons"],
            )
            self.db.add(stop)

        # Calculate costs
        transport_cost = route_data["total_distance_km"] * settings.AVERAGE_TRANSPORT_COST_PER_KM
        route.transport_cost_inr = transport_cost
        route.stubble_payment_inr = route_data["total_tons"] * 500  # Default price
        route.total_cost_inr = transport_cost + route.stubble_payment_inr

        await self.db.commit()
        await self.db.refresh(route)

        return route

    def _generate_optimization_id(self) -> str:
        """Generate unique optimization ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_str = "".join(random.choices(string.ascii_uppercase, k=4))
        return f"OPT-{timestamp}-{random_str}"

    def _generate_route_code(self) -> str:
        """Generate unique route code."""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_str = "".join(random.choices(string.digits, k=6))
        return f"RT-{timestamp}-{random_str}"

    async def optimize_single_route(
        self,
        plant_id: UUID,
        farm_ids: list[UUID],
    ) -> Optional[Route]:
        """
        Create optimal single route visiting specific farms.

        Args:
            plant_id: Destination biogas plant
            farm_ids: List of farms to visit

        Returns:
            Created Route or None
        """
        # Get farms
        farms_result = await self.db.execute(
            select(Farmer).where(Farmer.id.in_(farm_ids))
        )
        farms = list((await farms_result.scalars().all()))

        if not farms:
            return None

        # Get plant
        plant_result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == plant_id)
        )
        plant = plant_result.scalar_one_or_none()

        if not plant:
            return None

        # Build route data
        farm_dicts = [
            {
                "id": str(f.id),
                "latitude": f.latitude,
                "longitude": f.longitude,
                "expected_stubble_tons": f.expected_stubble_tons,
            }
            for f in farms
        ]

        route_data = await self._solve_vrp(
            plant=plant,
            farms=farm_dicts,
            vehicle_capacity_tons=100.0,  # Large capacity for single route
            max_routes=1,
        )

        if route_data:
            return await self._create_route_from_solution(route_data[0])

        return None
