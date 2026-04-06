"""Geospatial utility functions."""
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def find_nearby_farmers(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    radius_km: int = 10,
    min_stubble_tons: float = 0,
    limit: int = 50,
) -> list[Any]:
    """
    Find farmers within a radius using PostGIS.

    Args:
        db: Database session
        latitude: Center point latitude
        longitude: Center point longitude
        radius_km: Search radius in kilometers
        min_stubble_tons: Minimum stubble requirement
        limit: Maximum results

    Returns:
        List of Farmer objects sorted by distance
    """
    from app.models.farmer import Farmer

    query = text("""
        SELECT
            f.id, f.name, f.phone, f.village, f.district, f.state,
            f.latitude, f.longitude, f.expected_stubble_tons,
            ST_Distance(
                ST_MakePoint(f.longitude, f.latitude)::geography,
                ST_MakePoint(:lon, :lat)::geography
            ) / 1000 as distance_km
        FROM farmers f
        WHERE
            f.active = true
            AND f.latitude IS NOT NULL
            AND f.longitude IS NOT NULL
            AND f.expected_stubble_tons >= :min_stubble
            AND ST_DWithin(
                ST_MakePoint(f.longitude, f.latitude)::geography,
                ST_MakePoint(:lon, :lat)::geography,
                :radius * 1000
            )
        ORDER BY distance_km ASC
        LIMIT :limit
    """)

    result = await db.execute(
        query,
        {
            "lat": latitude,
            "lon": longitude,
            "radius": radius_km,
            "min_stubble": min_stubble_tons,
            "limit": limit,
        },
    )

    farmers = []
    for row in result:
        # Create farmer object from row
        farmer = Farmer(
            id=row.id,
            name=row.name,
            phone=row.phone,
            village=row.village,
            district=row.district,
            state=row.state,
            latitude=row.latitude,
            longitude=row.longitude,
            expected_stubble_tons=row.expected_stubble_tons,
        )
        farmer.distance_km = row.distance_km
        farmers.append(farmer)

    return farmers


async def find_nearby_biogas_plants(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    radius_km: int = 50,
    min_capacity: float = 0,
    limit: int = 20,
) -> list[Any]:
    """
    Find biogas plants within a radius using PostGIS.

    Args:
        db: Database session
        latitude: Center point latitude
        longitude: Center point longitude
        radius_km: Search radius in kilometers
        min_capacity: Minimum available capacity required
        limit: Maximum results

    Returns:
        List of BiogasPlant objects sorted by distance
    """
    from app.models.biogas_plant import BiogasPlant

    query = text("""
        SELECT
            p.id, p.name, p.operator, p.address, p.district, p.state,
            p.latitude, p.longitude, p.capacity_tons_per_day,
            p.current_stock_tons, p.max_storage_tons, p.price_per_ton,
            (p.max_storage_tons - p.current_stock_tons) as available_capacity,
            ST_Distance(
                ST_MakePoint(p.longitude, p.latitude)::geography,
                ST_MakePoint(:lon, :lat)::geography
            ) / 1000 as distance_km
        FROM biogas_plants p
        WHERE
            p.status = 'active'
            AND p.latitude IS NOT NULL
            AND p.longitude IS NOT NULL
            AND (p.max_storage_tons - p.current_stock_tons) >= :min_capacity
            AND ST_DWithin(
                ST_MakePoint(p.longitude, p.latitude)::geography,
                ST_MakePoint(:lon, :lat)::geography,
                :radius * 1000
            )
        ORDER BY distance_km ASC
        LIMIT :limit
    """)

    result = await db.execute(
        query,
        {
            "lat": latitude,
            "lon": longitude,
            "radius": radius_km,
            "min_capacity": min_capacity,
            "limit": limit,
        },
    )

    plants = []
    for row in result:
        plant = BiogasPlant(
            id=row.id,
            name=row.name,
            operator=row.operator,
            address=row.address,
            district=row.district,
            state=row.state,
            latitude=row.latitude,
            longitude=row.longitude,
            capacity_tons_per_day=row.capacity_tons_per_day,
            current_stock_tons=row.current_stock_tons,
            max_storage_tons=row.max_storage_tons,
            price_per_ton=row.price_per_ton,
        )
        plant.distance_km = row.distance_km
        plants.append(plant)

    return plants


def calculate_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """
    Calculate distance between two points using Haversine formula.

    Args:
        lat1, lon1: First point coordinates
        lat2, lon2: Second point coordinates

    Returns:
        Distance in kilometers
    """
    from math import radians, cos, sin, asin, sqrt

    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))

    return 6371 * c


# Alias for backward compatibility
haversine_distance = calculate_distance


def create_bounding_box(
    center_lat: float,
    center_lon: float,
    radius_km: float,
) -> dict[str, float]:
    """
    Create a bounding box around a center point.

    Args:
        center_lat: Center latitude
        center_lon: Center longitude
        radius_km: Radius in kilometers

    Returns:
        Dict with min/max lat/lon
    """
    from math import radians, degrees

    # Approximate degrees per km at given latitude
    km_per_degree_lat = 111.0
    km_per_degree_lon = 111.0 * cos(radians(center_lat))

    lat_delta = radius_km / km_per_degree_lat
    lon_delta = radius_km / km_per_degree_lon

    return {
        "min_lat": center_lat - lat_delta,
        "max_lat": center_lat + lat_delta,
        "min_lon": center_lon - lon_delta,
        "max_lon": center_lon + lon_delta,
    }


def point_in_bbox(
    lat: float,
    lon: float,
    bbox: dict[str, float],
) -> bool:
    """Check if a point is within a bounding box."""
    return (
        bbox["min_lat"] <= lat <= bbox["max_lat"]
        and bbox["min_lon"] <= lon <= bbox["max_lon"]
    )
