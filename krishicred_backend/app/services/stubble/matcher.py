"""Farm-plant matching service."""
import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.biogas_plant import BiogasPlant
from app.models.farmer import Farmer

settings = get_settings()
logger = get_logger(__name__)


class FarmPlantMatcher:
    """
    Service for matching farms with biogas plants.

    Uses geospatial queries and capacity constraints to find
    optimal farm-plant pairings.
    """

    def __init__(self, db: AsyncSession):
        """Initialize matcher with database session."""
        self.db = db

    async def find_nearby_farms_with_stubble(
        self,
        plant_id: UUID,
        radius_km: int = 50,
        min_stubble_tons: float = 1.0,
    ) -> list[dict]:
        """
        Find farms with available stubble near a biogas plant.

        Args:
            plant_id: UUID of the biogas plant
            radius_km: Search radius
            min_stubble_tons: Minimum stubble required

        Returns:
            List of farms with distance and available stubble
        """
        # Get plant location
        plant_result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == plant_id)
        )
        plant = plant_result.scalar_one_or_none()

        if not plant:
            logger.error(f"Plant {plant_id} not found")
            return []

        # Find nearby farms using raw SQL with PostGIS
        query = f"""
            SELECT
                f.id,
                f.name,
                f.phone,
                f.village,
                f.district,
                f.latitude,
                f.longitude,
                f.expected_stubble_tons,
                f.farm_area_hectares,
                ST_Distance(
                    ST_MakePoint(f.longitude, f.latitude)::geography,
                    ST_MakePoint(:plant_lon, :plant_lat)::geography
                ) / 1000 as distance_km
            FROM farmers f
            WHERE
                f.active = true
                AND f.latitude IS NOT NULL
                AND f.longitude IS NOT NULL
                AND f.expected_stubble_tons >= :min_stubble
                AND ST_DWithin(
                    ST_MakePoint(f.longitude, f.latitude)::geography,
                    ST_MakePoint(:plant_lon, :plant_lat)::geography,
                    :radius * 1000
                )
            ORDER BY distance_km ASC
        """

        result = await self.db.execute(
            query,
            {
                "plant_lat": plant.latitude,
                "plant_lon": plant.longitude,
                "radius": radius_km,
                "min_stubble": min_stubble_tons,
            },
        )

        farms = []
        for row in result:
            farms.append({
                "id": str(row.id),
                "name": row.name,
                "phone": row.phone,
                "village": row.village,
                "district": row.district,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "expected_stubble_tons": row.expected_stubble_tons,
                "farm_area_hectares": row.farm_area_hectares,
                "distance_km": round(row.distance_km, 2),
            })

        logger.info(f"Found {len(farms)} farms near plant {plant_id}")
        return farms

    async def find_nearby_plants_for_farm(
        self,
        farmer_id: UUID,
        radius_km: int = 50,
        min_capacity: float = 0,
    ) -> list[dict]:
        """
        Find biogas plants near a farm.

        Args:
            farmer_id: UUID of the farmer
            radius_km: Search radius
            min_capacity: Minimum required capacity

        Returns:
            List of plants with distance and available capacity
        """
        # Get farmer location
        farmer_result = await self.db.execute(
            select(Farmer).where(Farmer.id == farmer_id)
        )
        farmer = farmer_result.scalar_one_or_none()

        if not farmer or not farmer.has_coordinates():
            logger.error(f"Farmer {farmer_id} not found or has no coordinates")
            return []

        # Find nearby plants
        query = f"""
            SELECT
                p.id,
                p.name,
                p.operator,
                p.address,
                p.district,
                p.latitude,
                p.longitude,
                p.capacity_tons_per_day,
                p.current_stock_tons,
                p.max_storage_tons,
                p.price_per_ton,
                p.status,
                (p.max_storage_tons - p.current_stock_tons) as available_capacity,
                ST_Distance(
                    ST_MakePoint(p.longitude, p.latitude)::geography,
                    ST_MakePoint(:farmer_lon, :farmer_lat)::geography
                ) / 1000 as distance_km
            FROM biogas_plants p
            WHERE
                p.status = 'active'
                AND p.latitude IS NOT NULL
                AND p.longitude IS NOT NULL
                AND (p.max_storage_tons - p.current_stock_tons) >= :min_capacity
                AND ST_DWithin(
                    ST_MakePoint(p.longitude, p.latitude)::geography,
                    ST_MakePoint(:farmer_lon, :farmer_lat)::geography,
                    :radius * 1000
                )
            ORDER BY distance_km ASC
        """

        result = await self.db.execute(
            query,
            {
                "farmer_lat": farmer.latitude,
                "farmer_lon": farmer.longitude,
                "radius": radius_km,
                "min_capacity": min_capacity,
            },
        )

        plants = []
        for row in result:
            plants.append({
                "id": str(row.id),
                "name": row.name,
                "operator": row.operator,
                "address": row.address,
                "district": row.district,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "capacity_tons_per_day": row.capacity_tons_per_day,
                "current_stock_tons": row.current_stock_tons,
                "max_storage_tons": row.max_storage_tons,
                "price_per_ton": row.price_per_ton,
                "available_capacity": row.available_capacity,
                "distance_km": round(row.distance_km, 2),
            })

        logger.info(f"Found {len(plants)} plants near farmer {farmer_id}")
        return plants

    async def calculate_match_score(
        self,
        farmer_id: UUID,
        plant_id: UUID,
    ) -> float:
        """
        Calculate a compatibility score for farm-plant matching.

        Considers distance, capacity, price, and historical data.

        Returns:
            Score between 0 and 100
        """
        # Get farmer and plant
        farmer_result = await self.db.execute(
            select(Farmer).where(Farmer.id == farmer_id)
        )
        farmer = farmer_result.scalar_one_or_none()

        plant_result = await self.db.execute(
            select(BiogasPlant).where(BiogasPlant.id == plant_id)
        )
        plant = plant_result.scalar_one_or_none()

        if not farmer or not plant:
            return 0.0

        score = 100.0

        # Distance penalty (0.5 points per km)
        distance_km = await self._get_distance(farmer, plant)
        score -= min(distance_km * 0.5, 30)

        # Capacity bonus for plants with more space
        capacity_utilization = plant.capacity_utilization_percent
        if capacity_utilization < 50:
            score += 10
        elif capacity_utilization > 80:
            score -= 10

        # Price bonus (higher price for farmers)
        if plant.price_per_ton >= 600:
            score += 5
        elif plant.price_per_ton < 400:
            score -= 5

        # Historical data bonus (if farmer has used plant before)
        # TODO: Add historical relationship tracking

        return max(0, min(100, score))

    async def _get_distance(self, farmer: Farmer, plant: BiogasPlant) -> float:
        """Calculate distance between farmer and plant in km."""
        from math import radians, cos, sin, asin, sqrt

        # Haversine formula
        lon1, lat1, lon2, lat2 = map(
            radians,
            [farmer.longitude, farmer.latitude, plant.longitude, plant.latitude]
        )

        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))

        km = 6371 * c
        return km

    async def get_best_matches(
        self,
        farmer_id: UUID,
        limit: int = 5,
    ) -> list[dict]:
        """
        Get best plant matches for a farmer.

        Returns sorted list of plants with match scores.
        """
        plants = await self.find_nearby_plants_for_farm(farmer_id)

        # Calculate scores
        scored_plants = []
        for plant in plants:
            score = await self.calculate_match_score(
                farmer_id,
                UUID(plant["id"]),
            )
            plant["match_score"] = round(score, 1)
            scored_plants.append(plant)

        # Sort by score
        scored_plants.sort(key=lambda x: x["match_score"], reverse=True)

        return scored_plants[:limit]
