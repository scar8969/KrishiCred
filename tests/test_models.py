"""Tests for database models."""
import pytest
from uuid import uuid4
from datetime import datetime

from app.models import (
    Farmer,
    BiogasPlant,
    FireAlert,
    Route,
    CarbonCredit,
    Language,
    PlantStatus,
    AlertSource,
    AlertStatus,
    RouteStatus,
    CreditStatus,
    VerificationLevel,
)


@pytest.mark.asyncio
async def test_create_farmer(db_session):
    """Test creating a farmer."""
    farmer = Farmer(
        name="Test Farmer",
        phone="+919876543210",
        village="Test Village",
        district="Ludhiana",
        state="Punjab",
        language=Language.PUNJABI,
    )
    db_session.add(farmer)
    await db_session.commit()
    await db_session.refresh(farmer)

    assert farmer.id is not None
    assert farmer.name == "Test Farmer"
    assert farmer.phone == "+919876543210"
    assert farmer.language == Language.PUNJABI


@pytest.mark.asyncio
async def test_create_biogas_plant(db_session):
    """Test creating a biogas plant."""
    plant = BiogasPlant(
        name="Test Plant",
        operator="Test Operator",
        address="Test Address",
        district="Ludhiana",
        state="Punjab",
        latitude=30.9,
        longitude=75.85,
        capacity_tons_per_day=50.0,
        current_stock_tons=10.0,
        max_storage_tons=100.0,
        status=PlantStatus.ACTIVE,
    )
    db_session.add(plant)
    await db_session.commit()
    await db_session.refresh(plant)

    assert plant.id is not None
    assert plant.name == "Test Plant"
    assert plant.capacity_tons_per_day == 50.0
    assert plant.available_capacity == 90.0


@pytest.mark.asyncio
async def test_create_fire_alert(db_session):
    """Test creating a fire alert."""
    alert = FireAlert(
        satellite_id=f"MODIS_{uuid4().hex[:12]}",
        source=AlertSource.MODIS,
        detection_time=datetime.utcnow(),
        latitude=30.9,
        longitude=75.85,
        confidence=85.0,
        brightness=320.0,
        power=15.0,
        pixel_size_km=1.0,
        status=AlertStatus.DETECTED,
    )
    db_session.add(alert)
    await db_session.commit()
    await db_session.refresh(alert)

    assert alert.id is not None
    assert alert.source == AlertSource.MODIS
    assert alert.confidence == 85.0
    assert alert.status == AlertStatus.DETECTED


@pytest.mark.asyncio
async def test_farmer_soft_delete(db_session):
    """Test soft delete functionality for farmer."""
    farmer = Farmer(
        name="Test Farmer",
        phone="+919876543210",
        village="Test Village",
        district="Ludhiana",
        state="Punjab",
    )
    db_session.add(farmer)
    await db_session.commit()
    await db_session.refresh(farmer)

    # Soft delete
    farmer.soft_delete()
    await db_session.commit()

    assert farmer.is_deleted is True
    assert farmer.deleted_at is not None


@pytest.mark.asyncio
async def test_biogas_plant_capacity_utilization(db_session):
    """Test biogas plant capacity utilization calculation."""
    plant = BiogasPlant(
        name="Test Plant",
        operator="Test Operator",
        address="Test Address",
        district="Ludhiana",
        state="Punjab",
        capacity_tons_per_day=50.0,
        current_stock_tons=50.0,
        max_storage_tons=100.0,
    )
    db_session.add(plant)
    await db_session.commit()
    await db_session.refresh(plant)

    assert plant.capacity_utilization_percent == 50.0
    assert plant.can_accept_stubble is True
