"""Repository for BiogasPlant database operations."""
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.biogas_plant import BiogasPlant, PlantStatus


class BiogasPlantRepository:
    """Repository for BiogasPlant model operations."""

    def __init__(self, db: AsyncSession):
        """Initialize repository with database session."""
        self.db = db

    async def get(self, plant_id: UUID) -> Optional[BiogasPlant]:
        """Get a biogas plant by ID."""
        result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == plant_id)
        )
        return result.scalar_one_or_none()

    async def create(self, plant_data: dict[str, Any]) -> BiogasPlant:
        """Create a new biogas plant."""
        plant = BiogasPlant(**plant_data)
        self.db.add(plant)
        await self.db.commit()
        await self.db.refresh(plant)
        return plant

    async def update(
        self,
        plant_id: UUID,
        update_data: dict[str, Any],
    ) -> Optional[BiogasPlant]:
        """Update a biogas plant."""
        result = await self.db.execute(
            update(BiogasPlant)
            .where(BiogasPlant.id == plant_id)
            .values(**update_data)
            .returning(BiogasPlant)
        )
        await self.db.commit()

        plant = result.scalar_one_or_none()
        if plant:
            await self.db.refresh(plant)
        return plant

    async def delete(self, plant_id: UUID) -> bool:
        """Delete a biogas plant."""
        result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == plant_id)
        )
        plant = result.scalar_one_or_none()

        if plant:
            await self.db.delete(plant)
            await self.db.commit()
            return True
        return False

    async def list_all(
        self,
        status: Optional[PlantStatus] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[BiogasPlant]:
        """List all biogas plants with optional filtering."""
        query = select(BiogasPlant)

        if status:
            query = query.where(BiogasPlant.status == status)

        query = query.order_by(BiogasPlant.name).offset(offset).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_active_plants(self) -> list[BiogasPlant]:
        """Get all active biogas plants."""
        result = await self.db.execute(
            select(BiogasPlant)
            .where(BiogasPlant.status == PlantStatus.ACTIVE)
            .order_by(BiogasPlant.name)
        )
        return list(result.scalars().all())

    async def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 50,
        limit: int = 10,
    ) -> list[BiogasPlant]:
        """Find biogas plants near a location."""
        from app.utils.geo import haversine_distance

        # Get all active plants
        plants = await self.get_active_plants()

        # Filter by distance
        nearby_plants = []
        for plant in plants:
            distance = haversine_distance(
                latitude,
                longitude,
                plant.latitude,
                plant.longitude,
            )
            if distance <= radius_km:
                nearby_plants.append((plant, distance))

        # Sort by distance and limit results
        nearby_plants.sort(key=lambda x: x[1])
        return [plant for plant, _ in nearby_plants[:limit]]

    async def update_stock(
        self,
        plant_id: UUID,
        quantity_change_tons: float,
    ) -> Optional[BiogasPlant]:
        """Update plant stock level."""
        plant = await self.get(plant_id)
        if not plant:
            return None

        new_stock = plant.current_stock_tons + quantity_change_tons
        new_stock = max(0, min(new_stock, plant.max_storage_tons))

        return await self.update(plant_id, {"current_stock_tons": new_stock})

    async def get_capacity_stats(self) -> dict[str, Any]:
        """Get aggregate capacity statistics for all plants."""
        result = await self.db.execute(
            select(
                func.count().label("total_plants"),
                func.sum(BiogasPlant.capacity_tons_per_day).label("total_capacity"),
                func.sum(BiogasPlant.current_stock_tons).label("current_stock"),
                func.sum(BiogasPlant.max_storage_tons).label("total_storage"),
            ).where(BiogasPlant.status == PlantStatus.ACTIVE)
        )
        stats = result.one()

        return {
            "total_plants": stats.total_plants or 0,
            "total_capacity_per_day": float(stats.total_capacity or 0),
            "current_stock_tons": float(stats.current_stock or 0),
            "total_storage_tons": float(stats.total_storage or 0),
            "storage_utilization_percent": (
                float(stats.current_stock / stats.total_storage * 100)
                if stats.total_storage else 0
            ),
        }
