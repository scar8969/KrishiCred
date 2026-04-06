"""Biogas Plants API router - Plant management."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.schemas.biogas_plant import (
    BiogasPlantCreate,
    BiogasPlantUpdate,
    BiogasPlantResponse,
    BiogasPlantListResponse,
    BiogasPlantStatsResponse,
)
from app.repositories.biogas_plant import BiogasPlantRepository

router = APIRouter(
    prefix="/plants",
    tags=["plants"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=BiogasPlantResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(
    plant_data: BiogasPlantCreate,
    db: AsyncSession = Depends(get_db),
) -> BiogasPlantResponse:
    """Register a new biogas plant."""
    repo = BiogasPlantRepository(db)

    plant = await repo.create(plant_data)
    return BiogasPlantResponse.model_validate(plant)


@router.get("", response_model=BiogasPlantListResponse)
async def list_plants(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    district: Optional[str] = None,
    status: Optional[str] = None,
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> BiogasPlantListResponse:
    """List biogas plants with filtering and pagination."""
    repo = BiogasPlantRepository(db)

    plants, total = await repo.list(
        page=page,
        page_size=page_size,
        district=district,
        status=status,  # type: ignore
        active_only=active_only,
    )

    return BiogasPlantListResponse(
        items=[BiogasPlantResponse.model_validate(p) for p in plants],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{plant_id}", response_model=BiogasPlantResponse)
async def get_plant(
    plant_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> BiogasPlantResponse:
    """Get details of a specific biogas plant."""
    repo = BiogasPlantRepository(db)
    plant = await repo.get(plant_id)

    if not plant:
        raise NotFoundException("BiogasPlant", str(plant_id))

    return BiogasPlantResponse.model_validate(plant)


@router.patch("/{plant_id}", response_model=BiogasPlantResponse)
async def update_plant(
    plant_id: UUID,
    update_data: BiogasPlantUpdate,
    db: AsyncSession = Depends(get_db),
) -> BiogasPlantResponse:
    """Update plant details."""
    repo = BiogasPlantRepository(db)
    plant = await repo.update(plant_id, update_data)

    if not plant:
        raise NotFoundException("BiogasPlant", str(plant_id))

    return BiogasPlantResponse.model_validate(plant)


@router.post("/{plant_id}/stock")
async def update_plant_stock(
    plant_id: UUID,
    add_tons: float = Query(..., ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Update plant stock (add stubble)."""
    from app.models.biogas_plant import BiogasPlant

    repo = BiogasPlantRepository(db)
    plant = await repo.get(plant_id)

    if not plant:
        raise NotFoundException("BiogasPlant", str(plant_id))

    try:
        plant.add_stock(add_tons)
        await db.commit()
        await db.refresh(plant)

        return {
            "plant_id": plant_id,
            "added_tons": add_tons,
            "current_stock": plant.current_stock_tons,
            "available_capacity": plant.available_capacity,
        }
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{plant_id}/routes")
async def get_plant_routes(
    plant_id: UUID,
    status: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get routes for a specific plant."""
    from app.repositories.route import RouteRepository

    route_repo = RouteRepository(db)

    # Verify plant exists
    plant_repo = BiogasPlantRepository(db)
    plant = await plant_repo.get(plant_id)
    if not plant:
        raise NotFoundException("BiogasPlant", str(plant_id))

    routes = await route_repo.get_by_plant(plant_id, status=status, limit=limit)

    from app.schemas.route import RouteResponse
    return {
        "plant_id": plant_id,
        "total_routes": len(routes),
        "routes": [RouteResponse.model_validate(r) for r in routes],
    }


@router.get("/stats", response_model=BiogasPlantStatsResponse)
async def get_plant_stats(
    db: AsyncSession = Depends(get_db),
) -> BiogasPlantStatsResponse:
    """Get biogas plant statistics."""
    repo = BiogasPlantRepository(db)
    stats = await repo.get_stats()

    return BiogasPlantStatsResponse(**stats)


@router.get("/nearby")
async def find_nearby_plants(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: int = Query(50, ge=1, le=200),
    min_capacity: float = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Find biogas plants near a location."""
    repo = BiogasPlantRepository(db)

    plants = await repo.find_nearby(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        min_capacity=min_capacity,
    )

    from app.schemas.biogas_plant import BiogasPlantResponse
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "radius_km": radius_km,
        "total_plants": len(plants),
        "plants": [BiogasPlantResponse.model_validate(p) for p in plants],
    }
