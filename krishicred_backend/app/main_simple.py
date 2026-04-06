"""Minimal FastAPI application for KrishiCred platform."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Simple settings without pydantic for now
class Settings:
    APP_NAME = "KrishiCred API"
    APP_VERSION = "1.0.0"
    API_V1_PREFIX = "/api/v1"
    DEBUG = True
    ENVIRONMENT = "development"

settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Environment: {settings.ENVIRONMENT}")
    yield
    print("Shutting down application...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered climate finance platform for crop residue management",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-powered climate finance platform",
        "documentation": "/docs",
        "api_v1": settings.API_V1_PREFIX,
        "modules": {
            "firewatch": "Satellite fire detection and alerts (coming soon)",
            "stubble": "Farm-to-plant matching and routing (coming soon)",
            "carbon": "Credit calculation and verification (coming soon)",
        },
    }


# Basic API endpoints for now
@app.get("/api/v1/fires", tags=["fires"])
async def get_fires():
    """Get fire alerts (mock data)."""
    return {
        "fires": [],
        "total": 0,
        "message": "Fire detection service coming soon"
    }


@app.get("/api/v1/farmers", tags=["farmers"])
async def get_farmers():
    """Get farmers (mock data)."""
    return {
        "farmers": [],
        "total": 0,
        "message": "Farmer service coming soon"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
