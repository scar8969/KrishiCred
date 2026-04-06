"""Farmers API router - Farmer management."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.db.session import get_db
from app.schemas.farmer import (
    FarmerCreate,
    FarmerUpdate,
    FarmerResponse,
    FarmerListResponse,
    FarmerLocation,
    NearbyFarmersQuery,
    FarmerStatsResponse,
)
from app.repositories.farmer import FarmerRepository

router = APIRouter(
    prefix="/farmers",
    tags=["farmers"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    farmer_data: FarmerCreate,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    """Register a new farmer."""
    repo = FarmerRepository(db)

    # Check if phone already registered
    existing = await repo.get_by_phone(farmer_data.phone)
    if existing:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Farmer with phone {farmer_data.phone} already exists",
        )

    farmer = await repo.create(farmer_data)
    return FarmerResponse.model_validate(farmer)


@router.get("", response_model=FarmerListResponse)
async def list_farmers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    district: Optional[str] = None,
    verified: Optional[bool] = None,
    active: Optional[bool] = None,
    has_coordinates: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
) -> FarmerListResponse:
    """List farmers with filtering and pagination."""
    repo = FarmerRepository(db)

    farmers, total = await repo.list(
        page=page,
        page_size=page_size,
        district=district,
        verified=verified,
        active=active,
        has_coordinates=has_coordinates,
    )

    return FarmerListResponse(
        items=[FarmerResponse.model_validate(f) for f in farmers],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer(
    farmer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    """Get details of a specific farmer."""
    repo = FarmerRepository(db)
    farmer = await repo.get(farmer_id)

    if not farmer:
        raise NotFoundException("Farmer", str(farmer_id))

    return FarmerResponse.model_validate(farmer)


@router.patch("/{farmer_id}", response_model=FarmerResponse)
async def update_farmer(
    farmer_id: UUID,
    update_data: FarmerUpdate,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    """Update farmer details."""
    repo = FarmerRepository(db)
    farmer = await repo.update(farmer_id, update_data)

    if not farmer:
        raise NotFoundException("Farmer", str(farmer_id))

    return FarmerResponse.model_validate(farmer)


@router.post("/{farmer_id}/location", response_model=FarmerResponse)
async def update_farmer_location(
    farmer_id: UUID,
    location: FarmerLocation,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    """Update farmer's farm location."""
    repo = FarmerRepository(db)

    update_data = FarmerUpdate(
        latitude=location.latitude,
        longitude=location.longitude,
    )

    farmer = await repo.update(farmer_id, update_data)
    if not farmer:
        raise NotFoundException("Farmer", str(farmer_id))

    return FarmerResponse.model_validate(farmer)


@router.post("/nearby", response_model=list[FarmerResponse])
async def find_nearby_farmers(
    query: NearbyFarmersQuery,
    db: AsyncSession = Depends(get_db),
) -> list[FarmerResponse]:
    """Find farmers near a location."""
    repo = FarmerRepository(db)

    farmers = await repo.find_nearby(
        latitude=query.latitude,
        longitude=query.longitude,
        radius_km=query.radius_km,
        min_stubble_tons=query.min_stubble_tons,
    )

    return [FarmerResponse.model_validate(f) for f in farmers]


@router.get("/{farmer_id}/alerts")
async def get_farmer_alerts(
    farmer_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get fire alerts for a specific farmer."""
    from app.repositories.fire_alert import FireAlertRepository

    repo = FireAlertRepository(db)
    alerts = await repo.get_by_farmer(farmer_id, limit=limit)

    from app.schemas.fire_alert import FireAlertResponse
    return {
        "farmer_id": farmer_id,
        "total_alerts": len(alerts),
        "alerts": [FireAlertResponse.model_validate(a) for a in alerts],
    }


@router.get("/stats", response_model=FarmerStatsResponse)
async def get_farmer_stats(
    db: AsyncSession = Depends(get_db),
) -> FarmerStatsResponse:
    """Get farmer statistics."""
    repo = FarmerRepository(db)
    stats = await repo.get_stats()

    return FarmerStatsResponse(**stats)
