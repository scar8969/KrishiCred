"""Pytest configuration and fixtures for KrishiCred tests."""
import asyncio
from typing import AsyncGenerator, Generator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.models import (
    Farmer,
    BiogasPlant,
    FireAlert,
    Route,
    CarbonCredit,
)


# Test database URL (SQLite for testing)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test HTTP client."""
    from app.db.session import get_db

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def sample_farmer_data() -> dict:
    """Sample farmer data for testing."""
    return {
        "name": "Test Farmer",
        "phone": "+919876543210",
        "village": "Test Village",
        "district": "Ludhiana",
        "state": "Punjab",
        "latitude": 30.9,
        "longitude": 75.85,
        "language": "punjabi",
        "stubble_available_tons": 5.0,
        "expected_stubble_tons": 5.0,
    }


@pytest.fixture
def sample_plant_data() -> dict:
    """Sample biogas plant data for testing."""
    return {
        "name": "Test Biogas Plant",
        "operator": "Test Operator",
        "address": "Test Address",
        "district": "Ludhiana",
        "state": "Punjab",
        "latitude": 30.9,
        "longitude": 75.85,
        "capacity_tons_per_day": 50.0,
        "current_stock_tons": 10.0,
        "max_storage_tons": 100.0,
        "price_per_ton": 500.0,
    }


@pytest.fixture
def sample_fire_alert_data() -> dict:
    """Sample fire alert data for testing."""
    return {
        "satellite_id": f"MODIS_{uuid4().hex[:12]}",
        "source": "MODIS",
        "detection_time": "2024-01-15T10:30:00",
        "latitude": 30.9,
        "longitude": 75.85,
        "confidence": 85.0,
        "brightness": 320.0,
        "power": 15.0,
        "pixel_size_km": 1.0,
    }
