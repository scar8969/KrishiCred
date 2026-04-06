"""Core configuration for KrishiCred platform."""
from functools import lru_cache
from typing import Any, Dict, List, Optional

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "KrishiCred API"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # Security
    SECRET_KEY: str = Field(
        default="changeme-in-production",
        description="Secret key for JWT encoding"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "krishicred"
    POSTGRES_PASSWORD: str = "krishicred"
    POSTGRES_DB: str = "krishicred"
    POSTGRES_POOL_SIZE: int = 20
    POSTGRES_MAX_OVERFLOW: int = 10

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Build database URI from components."""
        # Use SQLite for development if PostgreSQL is not configured
        if self.ENVIRONMENT == "development" and self.POSTGRES_HOST == "localhost":
            # Check if we should use SQLite
            import os
            db_url = os.getenv("DATABASE_URL")
            if db_url and db_url.startswith("sqlite"):
                return db_url
            # Default to SQLite for development
            return "sqlite+aiosqlite:///./krishicred.db"

        from pydantic import PostgresDsn
        return str(PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        ))

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = 30 * 60  # 30 minutes

    # Satellite Processing
    GEE_SERVICE_ACCOUNT_KEY_PATH: str = "/path/to/key.json"
    GEE_PROJECT_ID: str = "krishicred-satellite"
    MODIS_COLLECTION: str = "MODIS/006/MCD14A1"
    VIIRS_COLLECTION: str = "NOAA/VIIRS/001/VNP14A1"

    # Processing Parameters
    FIRE_CONFIDENCE_THRESHOLD: float = 80.0  # Percentage
    FIRE_DETECTION_RADIUS_KM: int = 5  # Alert radius
    SATELLITE_CHECK_INTERVAL_HOURS: int = 6  # How often to check for fires
    MAX_FIRE_AGE_DAYS: int = 1  # Only consider recent fires

    # Geospatial
    PUNJAB_BOUNDING_BOX: Dict[str, float] = {
        "min_lat": 29.5,
        "max_lat": 32.5,
        "min_lon": 73.5,
        "max_lon": 76.5,
    }
    DEFAULT_CRS: str = "EPSG:4326"  # WGS84
    INDIA_CRS: str = "EPSG:32643"  # UTM Zone 43N

    # WhatsApp
    WHATSAPP_API_URL: str = "https://graph.facebook.com/v18.0"
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_TEMPLATE_NAMESPACE: str = "krishicred"
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = ""

    # Carbon Credits
    CARBON_CREDIT_PER_TON_CO2E: float = 1.0
    STUBBLE_TO_CO2_CONVERSION_RATIO: float = 2.5  # kg CO2e per kg stubble
    MIN_CREDIT_ISSUANCE_TONS: float = 0.1
    CREDIT_VERIFICATION_PERIOD_DAYS: int = 90
    CREDIT_PRICE_PER_TON_INR: float = 2500.0

    # Routing
    MAX_COLLECTION_DISTANCE_KM: int = 50
    MIN_VEHICLE_CAPACITY_TONS: float = 2.0
    MAX_VEHICLE_CAPACITY_TONS: float = 15.0
    ROUTING_OPTIMIZATION_TIMEOUT_SEC: int = 300
    AVERAGE_TRANSPORT_COST_PER_KM: float = 15.0  # INR

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    SENTRY_DSN: Optional[str] = None

    # Monitoring
    PROMETHEUS_ENABLED: bool = True
    PROMETHEUS_PORT: int = 9090

    # External APIs
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    MAPBOX_API_KEY: Optional[str] = None
    OPENWEATHERMAP_API_KEY: Optional[str] = None

    @field_validator("WHATSAPP_ACCESS_TOKEN")
    @classmethod
    def whatsapp_configured(cls, v: Optional[str]) -> Optional[str]:
        """Validate WhatsApp configuration when needed."""
        return v

    def get_celery_config(self) -> Dict[str, Any]:
        """Get Celery configuration."""
        return {
            "broker_url": self.CELERY_BROKER_URL,
            "result_backend": self.CELERY_RESULT_BACKEND,
            "task_track_started": self.CELERY_TASK_TRACK_STARTED,
            "task_time_limit": self.CELERY_TASK_TIME_LIMIT,
            "worker_prefetch_multiplier": 1,
            "worker_max_tasks_per_child": 1000,
        }

    def get_satellite_collections(self) -> List[str]:
        """Get active satellite collections."""
        return [
            self.MODIS_COLLECTION,
            self.VIIRS_COLLECTION,
        ]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
