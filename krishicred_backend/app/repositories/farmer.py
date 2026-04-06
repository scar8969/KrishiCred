"""Repository for Farmer database operations."""
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.farmer import Farmer, Language


class FarmerRepository:
    """Repository for Farmer model operations."""

    def __init__(self, db: AsyncSession):
        """Initialize repository with database session."""
        self.db = db

    async def get(self, farmer_id: UUID) -> Optional[Farmer]:
        """Get a farmer by ID."""
        result = await self.db.execute(
            select(Farmer).where(Farmer.id == farmer_id)
        )
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> Optional[Farmer]:
        """Get a farmer by phone number."""
        result = await self.db.execute(
            select(Farmer).where(Farmer.phone == phone)
        )
        return result.scalar_one_or_none()

    async def create(self, farmer_data: dict[str, Any]) -> Farmer:
        """Create a new farmer."""
        farmer = Farmer(**farmer_data)
        self.db.add(farmer)
        await self.db.commit()
        await self.db.refresh(farmer)
        return farmer

    async def update(
        self,
        farmer_id: UUID,
        update_data: dict[str, Any],
    ) -> Optional[Farmer]:
        """Update a farmer."""
        result = await self.db.execute(
            update(Farmer)
            .where(Farmer.id == farmer_id)
            .values(**update_data)
            .returning(Farmer)
        )
        await self.db.commit()

        farmer = result.scalar_one_or_none()
        if farmer:
            await self.db.refresh(farmer)
        return farmer

    async def delete(self, farmer_id: UUID) -> bool:
        """Delete a farmer (soft delete)."""
        farmer = await self.get(farmer_id)
        if farmer:
            farmer.soft_delete()
            await self.db.commit()
            return True
        return False

    async def list_all(
        self,
        limit: int = 100,
        offset: int = 0,
        active_only: bool = True,
    ) -> list[Farmer]:
        """List all farmers."""
        query = select(Farmer)

        if active_only:
            from app.models.farmer import Farmer
            query = query.where(Farmer.is_deleted == False)

        query = query.order_by(Farmer.name).offset(offset).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10,
        limit: int = 50,
    ) -> list[Farmer]:
        """Find farmers near a location."""
        from app.utils.geo import haversine_distance

        query = select(Farmer).where(Farmer.is_deleted == False)
        result = await self.db.execute(query)
        farmers = list(result.scalars().all())

        # Filter by distance
        nearby_farmers = []
        for farmer in farmers:
            if farmer.latitude and farmer.longitude:
                distance = haversine_distance(
                    latitude,
                    longitude,
                    farmer.latitude,
                    farmer.longitude,
                )
                if distance <= radius_km:
                    nearby_farmers.append((farmer, distance))

        # Sort by distance and limit results
        nearby_farmers.sort(key=lambda x: x[1])
        return [farmer for farmer, _ in nearby_farmers[:limit]]

    async def get_by_village(
        self,
        village: str,
        limit: int = 100,
    ) -> list[Farmer]:
        """Get farmers by village."""
        result = await self.db.execute(
            select(Farmer)
            .where(Farmer.village.ilike(f"%{village}%"))
            .where(Farmer.is_deleted == False)
            .order_by(Farmer.name)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_district(
        self,
        district: str,
        limit: int = 100,
    ) -> list[Farmer]:
        """Get farmers by district."""
        result = await self.db.execute(
            select(Farmer)
            .where(Farmer.district.ilike(f"%{district}%"))
            .where(Farmer.is_deleted == False)
            .order_by(Farmer.name)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update_stubble_availability(
        self,
        farmer_id: UUID,
        available_tons: float,
    ) -> Optional[Farmer]:
        """Update farmer's stubble availability."""
        return await self.update(
            farmer_id,
            {"stubble_available_tons": available_tons}
        )

    async def get_farmers_with_stubble(
        self,
        min_tons: float = 1.0,
        limit: int = 100,
    ) -> list[Farmer]:
        """Get farmers who have stubble available."""
        result = await self.db.execute(
            select(Farmer)
            .where(Farmer.stubble_available_tons >= min_tons)
            .where(Farmer.is_deleted == False)
            .order_by(Farmer.stubble_available_tons.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def search(
        self,
        search_term: str,
        limit: int = 50,
    ) -> list[Farmer]:
        """Search farmers by name or phone."""
        result = await self.db.execute(
            select(Farmer)
            .where(
                (
                    Farmer.name.ilike(f"%{search_term}%")
                ) | (
                    Farmer.phone.ilike(f"%{search_term}%")
                )
            )
            .where(Farmer.is_deleted == False)
            .order_by(Farmer.name)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_stats(self) -> dict[str, Any]:
        """Get farmer statistics."""
        total_result = await self.db.execute(
            select(func.count()).where(Farmer.is_deleted == False)
        )
        total_farmers = total_result.scalar() or 0

        # By language
        language_result = await self.db.execute(
            select(Farmer.language, func.count())
            .where(Farmer.is_deleted == False)
            .group_by(Farmer.language)
        )
        by_language = {lang.value: count for lang, count in language_result.all()}

        # Total stubble available
        stubble_result = await self.db.execute(
            select(func.sum(Farmer.stubble_available_tons))
            .where(Farmer.is_deleted == False)
        )
        total_stubble = float(stubble_result.scalar() or 0)

        return {
            "total_farmers": total_farmers,
            "by_language": by_language,
            "total_stubble_available_tons": total_stubble,
        }
