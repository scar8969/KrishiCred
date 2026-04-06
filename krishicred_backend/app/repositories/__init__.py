"""Repository layer for database operations."""
from app.repositories.fire_alert import FireAlertRepository
from app.repositories.biogas_plant import BiogasPlantRepository
from app.repositories.route import RouteRepository
from app.repositories.carbon_credit import CarbonCreditRepository
from app.repositories.farmer import FarmerRepository

__all__ = [
    "FireAlertRepository",
    "BiogasPlantRepository",
    "RouteRepository",
    "CarbonCreditRepository",
    "FarmerRepository",
]
