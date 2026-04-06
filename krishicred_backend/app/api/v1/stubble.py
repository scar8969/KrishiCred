"""StubbleRoute API router - Farm-to-plant matching and routing."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException
from app.db.session import get_db
from app.schemas.route import (
    RouteCreate,
    RouteUpdate,
    RouteDispatch,
    RouteCompletion,
    RouteResponse,
    RouteListResponse,
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    RouteStatsResponse,
    RouteQueryParams,
)
from app.services.stubble.matcher import FarmPlantMatcher
from app.services.stubble.optimizer import RouteOptimizer
from app.services.stubble.dispatcher import RouteDispatcher
from app.repositories.route import RouteRepository

router = APIRouter(
    prefix="/stubble",
    tags=["stubble"],
    responses={404: {"description": "Not found"}},
)


@router.post("/routes", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(
    route_data: RouteCreate,
    db: AsyncSession = Depends(get_db),
) -> RouteResponse:
    """
    Create a new stubble collection route.

    Routes connect farms to biogas plants for stubble collection.
    """
    dispatcher = RouteDispatcher(db)

    # Validate farm and plant
    await dispatcher.validate_route_data(route_data)

    # Create route
    route = await dispatcher.create_route(route_data)

    return RouteResponse.model_validate(route)


@router.get("/routes", response_model=RouteListResponse)
async def list_routes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    plant_id: Optional[UUID] = None,
    farmer_id: Optional[UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
) -> RouteListResponse:
    """List routes with filtering and pagination."""
    repo = RouteRepository(db)

    params = RouteQueryParams(
        status=status,  # type: ignore
        plant_id=plant_id,
        farmer_id=farmer_id,
        date_from=date_from,
        date_to=date_to,
    )

    routes, total = await repo.list_routes(
        page=page,
        page_size=page_size,
        params=params,
    )

    return RouteListResponse(
        items=[RouteResponse.model_validate(route) for route in routes],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/routes/{route_id}", response_model=RouteResponse)
async def get_route(
    route_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> RouteResponse:
    """Get details of a specific route."""
    repo = RouteRepository(db)
    route = await repo.get(route_id)

    if not route:
        raise NotFoundException("Route", str(route_id))

    return RouteResponse.model_validate(route)


@router.patch("/routes/{route_id}", response_model=RouteResponse)
async def update_route(
    route_id: UUID,
    update_data: RouteUpdate,
    db: AsyncSession = Depends(get_db),
) -> RouteResponse:
    """Update route details."""
    repo = RouteRepository(db)
    route = await repo.update(route_id, update_data)

    if not route:
        raise NotFoundException("Route", str(route_id))

    return RouteResponse.model_validate(route)


@router.post("/routes/{route_id}/dispatch", response_model=RouteResponse)
async def dispatch_route(
    route_id: UUID,
    dispatch_data: RouteDispatch,
    db: AsyncSession = Depends(get_db),
) -> RouteResponse:
    """
    Dispatch a route for collection.

    Assigns a vehicle and driver to the route.
    """
    dispatcher = RouteDispatcher(db)

    route = await dispatcher.dispatch(
        route_id=route_id,
        vehicle_number=dispatch_data.vehicle_number,
        driver_name=dispatch_data.driver_name,
        driver_phone=dispatch_data.driver_phone,
    )

    if not route:
        raise NotFoundException("Route", str(route_id))

    return RouteResponse.model_validate(route)


@router.post("/routes/{route_id}/complete", response_model=RouteResponse)
async def complete_route(
    route_id: UUID,
    completion_data: RouteCompletion,
    db: AsyncSession = Depends(get_db),
) -> RouteResponse:
    """
    Mark route as completed.

    Records the actual amount of stubble collected.
    """
    dispatcher = RouteDispatcher(db)

    route = await dispatcher.complete(
        route_id=route_id,
        collected_tons=completion_data.collected_tons,
        notes=completion_data.notes,
    )

    if not route:
        raise NotFoundException("Route", str(route_id))

    return RouteResponse.model_validate(route)


@router.post("/optimize", response_model=RouteOptimizationResponse)
async def optimize_routes(
    request: RouteOptimizationRequest,
    db: AsyncSession = Depends(get_db),
) -> RouteOptimizationResponse:
    """
    Optimize stubble collection routes.

    Uses the Vehicle Routing Problem (VRP) algorithm to create
    optimal collection routes for a biogas plant.
    """
    optimizer = RouteOptimizer(db)

    result = await optimizer.optimize_for_plant(
        plant_id=request.plant_id,
        max_distance_km=request.max_distance_km,
        min_stubble_tons=request.min_stubble_tons,
        max_routes=request.max_routes,
        vehicle_capacity_tons=request.vehicle_capacity_tons,
    )

    return RouteOptimizationResponse(
        optimization_id=result["optimization_id"],
        total_farmers=result["total_farmers"],
        total_stubble_tons=result["total_stubble_tons"],
        routes_created=result["routes_created"],
        estimated_collections_tons=result["estimated_collections_tons"],
        routes=[RouteResponse.model_validate(r) for r in result["routes"]],
        optimization_metadata=result.get("metadata", {}),
    )


@router.post("/optimize-trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_optimization(
    plant_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger route optimization in background.

    Creates optimal routes for all active plants or a specific plant.
    """
    from app.tasks.routing_tasks import optimize_collection_routes

    task = optimize_collection_routes.delay(plant_id=str(plant_id) if plant_id else None)

    return {
        "message": "Route optimization initiated",
        "task_id": task.id,
        "plant_id": plant_id,
    }


@router.get("/nearby-farms")
async def find_nearby_farms(
    plant_id: UUID,
    radius_km: int = Query(50, ge=1, le=100),
    min_stubble_tons: float = Query(1.0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Find farms with available stubble near a biogas plant.

    Returns a list of farms sorted by distance that have stubble
    available for collection.
    """
    matcher = FarmPlantMatcher(db)

    farms = await matcher.find_nearby_farms_with_stubble(
        plant_id=plant_id,
        radius_km=radius_km,
        min_stubble_tons=min_stubble_tons,
    )

    return {
        "plant_id": plant_id,
        "radius_km": radius_km,
        "total_farms": len(farms),
        "farms": farms,
    }


@router.get("/stats", response_model=RouteStatsResponse)
async def get_route_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> RouteStatsResponse:
    """Get route statistics for the specified period."""
    repo = RouteRepository(db)

    stats = await repo.get_stats(days=days)

    return RouteStatsResponse(**stats)


@router.get("/plants/{plant_id}/capacity")
async def get_plant_capacity(
    plant_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get current capacity and incoming stubble for a plant."""
    from app.repositories.biogas_plant import BiogasPlantRepository

    repo = BiogasPlantRepository(db)
    plant = await repo.get(plant_id)

    if not plant:
        raise NotFoundException("BiogasPlant", str(plant_id))

    return {
        "plant_id": plant_id,
        "plant_name": plant.name,
        "capacity_tons_per_day": plant.capacity_tons_per_day,
        "current_stock_tons": plant.current_stock_tons,
        "max_storage_tons": plant.max_storage_tons,
        "available_capacity": plant.available_capacity,
        "capacity_utilization_percent": plant.capacity_utilization_percent,
        "can_accept_stubble": plant.can_accept_stubble,
    }
