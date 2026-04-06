"""API v1 router initialization."""
from fastapi import APIRouter

from app.api.v1 import firewatch, stubble, carbon, farmers, plants

api_router = APIRouter()

# Register all module routers
api_router.include_router(firewatch.router)
api_router.include_router(stubble.router)
api_router.include_router(carbon.router)
api_router.include_router(farmers.router)
api_router.include_router(plants.router)

__all__ = ["api_router"]
