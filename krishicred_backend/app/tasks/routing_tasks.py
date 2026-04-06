"""Route optimization and management tasks."""
import logging
from datetime import datetime, timedelta

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.session import async_session_maker
from app.services.stubble.optimizer import RouteOptimizer

settings = get_settings()
logger = get_logger(__name__)


@shared_task(
    name="app.tasks.routing_tasks.optimize_all_plant_routes",
    bind=True,
    max_retries=2,
)
def optimize_all_plant_routes(self) -> dict:
    """
    Optimize routes for all active biogas plants.

    Runs the VRP solver to create optimal collection routes
    based on available stubble and plant capacity.
    """
    import asyncio

    async def _optimize():
        async with async_session_maker() as db:
            from app.repositories.biogas_plant import BiogasPlantRepository

            plant_repo = BiogasPlantRepository(db)
            optimizer = RouteOptimizer(db)

            # Get all active plants
            plants = await plant_repo.get_active_plants()

            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "total_plants": len(plants),
                "plants_processed": 0,
                "total_routes_created": 0,
                "total_stubble_tons": 0.0,
                "errors": [],
            }

            for plant in plants:
                try:
                    if not plant.can_accept_stubble:
                        logger.info(f"Skipping {plant.name} - at capacity")
                        continue

                    plant_result = await optimizer.optimize_for_plant(
                        plant_id=plant.id,
                        max_distance_km=settings.MAX_COLLECTION_DISTANCE_KM,
                        min_stubble_tons=settings.MIN_VEHICLE_CAPACITY_TONS,
                        max_routes=20,
                        vehicle_capacity_tons=10.0,
                    )

                    results["plants_processed"] += 1
                    results["total_routes_created"] += plant_result["routes_created"]
                    results["total_stubble_tons"] += plant_result["estimated_collections_tons"]

                    logger.info(
                        f"Optimized routes for {plant.name}: "
                        f"{plant_result['routes_created']} routes, "
                        f"{plant_result['estimated_collections_tons']} tons"
                    )

                except Exception as e:
                    error_msg = f"Error optimizing for plant {plant.id}: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)

            logger.info(f"Route optimization complete: {results}")
            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_optimize())


@shared_task(
    name="app.tasks.routing_tasks.optimize_collection_routes",
    bind=True,
)
def optimize_collection_routes(self, plant_id: str = None) -> dict:
    """
    Optimize routes for a specific plant or all plants.

    Args:
        plant_id: Optional UUID of plant to optimize

    Returns:
        Dict with optimization results
    """
    if plant_id:
        # Optimize single plant
        return optimize_single_plant_routes(plant_id)
    else:
        # Optimize all plants
        return optimize_all_plant_routes()


def optimize_single_plant_routes(plant_id: str) -> dict:
    """Optimize routes for a single plant."""
    import asyncio
    from uuid import UUID

    async def _optimize():
        async with async_session_maker() as db:
            optimizer = RouteOptimizer(db)

            result = await optimizer.optimize_for_plant(
                plant_id=UUID(plant_id),
                max_distance_km=settings.MAX_COLLECTION_DISTANCE_KM,
                min_stubble_tons=settings.MIN_VEHICLE_CAPACITY_TONS,
            )

            result["plant_id"] = plant_id
            result["timestamp"] = datetime.utcnow().isoformat()

            logger.info(f"Single plant optimization complete: {result}")
            return result

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_optimize())


@shared_task(
    name="app.tasks.routing_tasks.dispatch_routes",
    bind=True,
)
def dispatch_routes(self, route_ids: list[str]) -> dict:
    """
    Dispatch multiple routes for collection.

    Args:
        route_ids: List of route UUIDs to dispatch

    Returns:
        Dict with dispatch results
    """
    import asyncio
    from uuid import UUID

    async def _dispatch():
        async with async_session_maker() as db:
            from app.services.stubble.dispatcher import RouteDispatcher
            from app.repositories.route import RouteRepository

            dispatcher = RouteDispatcher(db)
            route_repo = RouteRepository(db)

            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "total_routes": len(route_ids),
                "dispatched": 0,
                "failed": 0,
                "errors": [],
            }

            for route_id in route_ids:
                try:
                    route = await route_repo.get(UUID(route_id))
                    if not route:
                        results["errors"].append(f"Route {route_id} not found")
                        results["failed"] += 1
                        continue

                    # Auto-assign vehicle (in production, this would query available vehicles)
                    vehicle_number = f"PB{abs(hash(route_id)) % 10000:04d}"
                    driver_name = "Auto Assigned"
                    driver_phone = "+919876543210"

                    await dispatcher.dispatch(
                        route_id=UUID(route_id),
                        vehicle_number=vehicle_number,
                        driver_name=driver_name,
                        driver_phone=driver_phone,
                    )

                    results["dispatched"] += 1

                except Exception as e:
                    error_msg = f"Failed to dispatch route {route_id}: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)
                    results["failed"] += 1

            logger.info(f"Route dispatch complete: {results}")
            return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_dispatch())


@shared_task(
    name="app.tasks.routing_tasks.check_route_completion",
    bind=True,
)
def check_route_completion(self, route_id: str) -> dict:
    """
    Check and update route completion status.

    Sends reminders if routes are overdue.
    """
    import asyncio
    from uuid import UUID

    async def _check():
        async with async_session_maker() as db:
            from app.repositories.route import RouteRepository

            route_repo = RouteRepository(db)
            route = await route_repo.get(UUID(route_id))

            if not route:
                return {"error": "Route not found"}

            # Check if route is overdue
            if route.status == "dispatched" and route.scheduled_at:
                overdue_hours = (datetime.utcnow() - route.scheduled_at).total_seconds() / 3600

                if overdue_hours > 24:  # Overdue by more than 24 hours
                    logger.warning(f"Route {route_id} is overdue by {overdue_hours:.1f} hours")

                    # In production, send reminder to driver/plant
                    return {
                        "route_id": route_id,
                        "status": "overdue",
                        "overdue_hours": overdue_hours,
                    }

            return {
                "route_id": route_id,
                "status": route.status,
                "completion_percentage": route.completion_percentage,
            }

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_check())
