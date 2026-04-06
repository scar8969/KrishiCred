# KrishiCred Backend Architecture

An AI-powered climate finance platform for crop residue burning detection, farm-to-plant routing, and carbon credit monetization.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (FastAPI)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │  FireWatch   │  │ StubbleRoute │  │ CarbonLedger │                      │
│  │   Service    │  │   Service    │  │   Service    │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
│         │                 │                 │                               │
│         └─────────────────┴─────────────────┘                               │
│                           │                                                 │
│                  ┌────────▼────────┐                                        │
│                  │  Service Layer  │                                        │
│                  │  (Business      │                                        │
│                  │   Logic)        │                                        │
│                  └────────┬────────┘                                        │
├───────────────────────────┼─────────────────────────────────────────────────┤
│                           │                                                 │
│  ┌────────────────────────┼─────────────────────────────────────────────┐  │
│  │                        │              Data Layer                       │  │
│  │  ┌─────────────────────┼───────────────────────────────────────────┐  │  │
│  │  │                     │                                           │  │  │
│  │  │  ┌──────────────┐   │   ┌──────────────┐  ┌──────────────┐      │  │  │
│  │  │  │   PostgreSQL │   │   │    Redis     │  │  TimescaleDB │      │  │  │
│  │  │  │   + PostGIS  │   │   │   (Cache/    │  │ (Time-series │      │  │  │
│  │  │  │              │   │   │    Queue)    │  │   Data)      │      │  │  │
│  │  │  └──────────────┘   │   └──────────────┘  └──────────────┘      │  │  │
│  │  │                     │                                           │  │  │
│  │  └─────────────────────┼───────────────────────────────────────────┘  │  │
│  │                        │                                             │  │
│  └────────────────────────┼─────────────────────────────────────────────┘  │
├───────────────────────────┼─────────────────────────────────────────────────┤
│                           │                                                 │
│  ┌────────────────────────┼─────────────────────────────────────────────┐  │
│  │              Background Task Processing (Celery)                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Satellite   │  │   Routing    │  │   Credit     │                │  │
│  │  │  Processing  │  │  Optimizer   │  │  Calculator  │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                           │                                                 │
│  ┌────────────────────────┼─────────────────────────────────────────────┐  │
│  │                    External Services                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  NASA Earth  │  │   WhatsApp   │  │  Payment     │                │  │
│  │  │   Engine     │  │   Business   │  │  Gateway     │                │  │
│  │  │              │  │   API        │  │              │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **API Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 16+ with PostGIS 3.4+, TimescaleDB 2.14+
- **Cache/Queue**: Redis 7+
- **Background Tasks**: Celery 5.3+
- **Satellite Data**: Google Earth Engine API
- **Messaging**: WhatsApp Business API
- **Monitoring**: Prometheus + Grafana

## Project Structure

```
krishicred_backend/
├── app/
│   ├── api/                    # API routers
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── firewatch.py    # Fire detection endpoints
│   │   │   ├── stubble.py      # Routing endpoints
│   │   │   ├── carbon.py       # Carbon credit endpoints
│   │   │   ├── farmers.py      # Farmer management
│   │   │   └── plants.py       # Biogas plant management
│   │   └── __init__.py
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py           # Settings
│   │   ├── security.py         # Authentication
│   │   ├── logging.py          # Logging setup
│   │   └── exceptions.py       # Custom exceptions
│   ├── db/                     # Database
│   │   ├── __init__.py
│   │   ├── session.py          # DB session management
│   │   ├── base.py             # Base model
│   │   └── init_db.py          # DB initialization
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── farmer.py
│   │   ├── fire_alert.py
│   │   ├── biogas_plant.py
│   │   ├── route.py
│   │   ├── carbon_credit.py
│   │   └── transaction.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── farmer.py
│   │   ├── fire_alert.py
│   │   ├── biogas_plant.py
│   │   ├── route.py
│   │   ├── carbon_credit.py
│   │   └── transaction.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── firewatch/
│   │   │   ├── __init__.py
│   │   │   ├── detector.py     # Fire detection logic
│   │   │   ├── alerting.py     # Alert management
│   │   │   └── satellite.py    # Earth Engine integration
│   │   ├── stubble/
│   │   │   ├── __init__.py
│   │   │   ├── matcher.py      # Farm-plant matching
│   │   │   ├── optimizer.py    # Route optimization
│   │   │   └── dispatcher.py   # Dispatch logic
│   │   └── carbon/
│   │       ├── __init__.py
│   │       ├── calculator.py   # Credit calculation
│   │       ├── verifier.py     # Verification logic
│   │       └── monetizer.py    # Monetization
│   ├── tasks/                  # Celery tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── satellite_tasks.py
│   │   ├── routing_tasks.py
│   │   └── carbon_tasks.py
│   ├── repositories/           # Data access layer
│   │   ├── __init__.py
│   │   ├── farmer.py
│   │   ├── fire_alert.py
│   │   ├── biogas_plant.py
│   │   └── carbon_credit.py
│   ├── utils/                  # Utilities
│   │   ├── __init__.py
│   │   ├── whatsapp.py         # WhatsApp integration
│   │   ├── geo.py              # Geospatial utilities
│   │   └ i18n.py               # Translations (Punjabi)
│   └── main.py                 # FastAPI application
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── scripts/
│   ├── init_db.py
│   └── seed_data.py
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── gunicorn_config.py
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── .env.example
├── pyproject.toml
└── README.md
```

## Quick Start

```bash
# Install dependencies
poetry install

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Run migrations
alembic upgrade head

# Run API server
uvicorn app.main:app --reload

# Run Celery worker
celery -A app.tasks.celery_app worker -l info
celery -A app.tasks.celery_app beat -l info
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
