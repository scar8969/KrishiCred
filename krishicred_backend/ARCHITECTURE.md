# KrishiCred Backend Architecture

## Overview

KrishiCred is an AI-powered climate finance platform that detects crop residue burning via satellite, sends WhatsApp alerts to farmers, routes stubble to biogas plants, and monetizes carbon credits.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Gateway (FastAPI)                              │
│                         (Load Balanced / Multi-region)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │  FireWatch   │  │ StubbleRoute │  │ CarbonLedger │                      │
│  │   Service    │  │   Service    │  │   Service    │                      │
│  │              │  │              │  │              │                      │
│  │ - Detection  │  │ - Matching   │  │ - Calc       │                      │
│  │ - Alerting   │  │ - Routing    │  │ - Verify     │                      │
│  │ - Monitoring │  │ - Dispatch   │  │ - Monetize   │                      │
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
│  │  │  (MODIS/     │  │  (VRP Solver)│  │  (Auto-calc) │                │  │
│  │  │   VIIRS)     │  │              │  │              │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                          │  │
│  │  Scheduled Tasks (Celery Beat):                                          │  │
│  │  - Every 6 hours: Process satellite data                                │  │
│  │  - Daily at 6 AM: Optimize routes                                      │  │
│  │  - Hourly: Calculate pending credits                                   │  │
│  │  - Daily at 8 PM: Send summary                                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                           │                                                 │
│  ┌────────────────────────┼─────────────────────────────────────────────┐  │
│  │                    External Services                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  NASA Earth  │  │   WhatsApp   │  │  Payment     │                │  │
│  │  │   Engine     │  │   Business   │  │  Gateway     │                │  │
│  │  │   (MODIS/    │  │   API        │  │  (Razorpay/  │                │  │
│  │  │   VIIRS)     │  │              │  │   UPI)       │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Service Boundaries

### 1. FireWatch AI Service

**Purpose**: Detect crop residue burning and alert farmers

**Key Responsibilities**:
- Fetch MODIS/VIIRS satellite data from Google Earth Engine
- Detect thermal anomalies (fires)
- Match detections with farm locations
- Send WhatsApp alerts in Punjabi/Hindi
- Track farmer responses

**API Endpoints**:
- `POST /firewatch/alerts` - Create alert from satellite
- `GET /firewatch/alerts` - List alerts with filters
- `POST /firewatch/alerts/{id}/send` - Send WhatsApp alerts
- `POST /firewatch/alerts/{id}/respond` - Record farmer response
- `POST /firewatch/process-satellite` - Trigger satellite processing

**Background Tasks**:
- `process_satellite_data` - Fetch and process satellite imagery
- `send_fire_alerts` - Send WhatsApp messages
- `cleanup_old_alerts` - Remove old resolved alerts

**Data Flow**:
```
Earth Engine API → MODIS/VIIRS Collections → Fire Detection
                                                            ↓
                                                    Match Farms (PostGIS)
                                                            ↓
                                                    WhatsApp Business API
```

### 2. StubbleRoute Service

**Purpose**: Match farms with biogas plants and optimize collection

**Key Responsibilities**:
- Find farms with available stubble
- Find nearby biogas plants with capacity
- Run VRP solver for route optimization
- Dispatch collection vehicles
- Track route completion

**API Endpoints**:
- `POST /stubble/routes` - Create collection route
- `GET /stubble/routes` - List routes
- `POST /stubble/routes/{id}/dispatch` - Dispatch vehicle
- `POST /stubble/routes/{id}/complete` - Mark complete
- `POST /stubble/optimize` - Run route optimization
- `GET /stubble/nearby-farms` - Find farms near plant

**Background Tasks**:
- `optimize_all_plant_routes` - Daily route optimization
- `optimize_collection_routes` - Per-plant optimization
- `dispatch_routes` - Batch dispatch
- `check_route_completion` - Status checks

**Data Flow**:
```
Farm Locations + Plant Capacity + Stubble Availability
                               ↓
                    VRP Solver (Nearest-Neighbor)
                               ↓
                    Route Creation → Dispatch → Completion
                               ↓
                    Trigger Credit Calculation
```

### 3. CarbonLedger Service

**Purpose**: Calculate, verify, and monetize carbon credits

**Key Responsibilities**:
- Calculate CO2e from stubble quantities
- Verify credits after waiting period
- Generate certificates
- Sell credits on market
- Distribute earnings

**API Endpoints**:
- `POST /carbon/calculate` - Calculate potential credits
- `POST /carbon/credits` - Create credit record
- `GET /carbon/credits` - List credits
- `POST /carbon/credits/{id}/verify` - Verify credit
- `POST /carbon/credits/{id}/certify` - Issue certificate
- `POST /carbon/credits/{id}/sell` - Sell credit

**Background Tasks**:
- `process_pending_credits` - Calculate from completed routes
- `verify_pending_credits` - Auto-verify after threshold
- `aggregate_credits` - Generate statistics
- `check_credit_expiry` - Monitor expiring credits

**Data Flow**:
```
Completed Route → Stubble Quantity → CO2e Calculation
                                          ↓
                                   Pending Credit
                                          ↓
                            Verification Period (90 days)
                                          ↓
                               Verified → Certified
                                          ↓
                                   Market Sale
                                          ↓
                            Earnings Distribution
                              (60% Farmer, 30% Plant, 10% Platform)
```

## API Structure

### Base URL
```
/api/v1
```

### Common Patterns

**Pagination**:
```json
GET /resource?page=1&page_size=20

Response:
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

**Error Response**:
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": {...}
}
```

**Filters**:
- Date ranges: `start_date`, `end_date` (ISO 8601)
- Status: `status=active|pending|completed`
- IDs: `farmer_id=uuid`, `plant_id=uuid`

### Rate Limiting

- 60 requests per minute
- 1000 requests per hour
- Per-IP and per-API-key

## Background Task Architecture

### Task Queues

Four dedicated queues for different workload types:

| Queue | Purpose | Workers |
|-------|---------|---------|
| `satellite` | Earth Engine processing | 2 |
| `routing` | VRP optimization | 2 |
| `carbon` | Credit calculations | 1 |
| `notifications` | WhatsApp sending | 2 |

### Schedule

| Task | Frequency | Queue |
|------|-----------|-------|
| Process satellite data | Every 6 hours | satellite |
| Optimize routes | Daily 6 AM | routing |
| Calculate credits | Hourly | carbon |
| Daily summary | Daily 8 PM | notifications |
| Cleanup alerts | Daily midnight | satellite |

### Monitoring

- **Flower**: http://localhost:5555 - Celery task monitoring
- **Prometheus**: Metrics on port 9090

## Satellite Data Pipeline

### Data Sources

1. **MODIS** (Moderate Resolution Imaging Spectroradiometer)
   - Collection: `MODIS/006/MCD14A1`
   - Resolution: 1km
   - Frequency: 2x daily

2. **VIIRS** (Visible Infrared Imaging Radiometer Suite)
   - Collection: `NOAA/VIIRS/001/VNP14A1`
   - Resolution: 375m
   - Frequency: 2x daily

### Processing Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│  1. FETCH                                                     │
│     - Query GEE for time range (last 6 hours)                 │
│     - Filter by Punjab bounding box                           │
│     - Filter by confidence threshold (80%)                    │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  2. DETECT                                                    │
│     - Extract fire pixels                                     │
│     - Get centroid coordinates                                │
│     - Extract brightness temperature                          │
│     - Extract radiative power                                 │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  3. DEDUPLICATE                                               │
│     - Check for existing alerts (satellite_id + time)         │
│     - Merge overlapping detections                            │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  4. MATCH                                                     │
│     - Find farms within 5km radius                            │
│     - PostGIS ST_DWithin query                                │
│     - Sort by distance                                        │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  5. ALERT                                                     │
│     - Create FireAlert records                               │
│     - Link to nearest farmer                                  │
│     - Send WhatsApp messages                                  │
└────────────────────────────────────────────────────────────────┘
```

## File Structure

```
krishicred_backend/
├── app/
│   ├── api/                    # API routers
│   │   └── v1/
│   │       ├── firewatch.py    # Fire detection endpoints
│   │       ├── stubble.py      # Routing endpoints
│   │       ├── carbon.py       # Carbon credit endpoints
│   │       ├── farmers.py      # Farmer management
│   │       └── plants.py       # Biogas plant management
│   ├── core/                   # Core configuration
│   │   ├── config.py           # Settings
│   │   ├── security.py         # Authentication
│   │   ├── logging.py          # Logging setup
│   │   └── exceptions.py       # Custom exceptions
│   ├── db/                     # Database
│   │   ├── session.py          # DB session management
│   │   └── base.py             # Base model
│   ├── models/                 # SQLAlchemy models
│   │   ├── farmer.py
│   │   ├── fire_alert.py
│   │   ├── biogas_plant.py
│   │   ├── route.py
│   │   └── carbon_credit.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── farmer.py
│   │   ├── fire_alert.py
│   │   ├── biogas_plant.py
│   │   ├── route.py
│   │   └── carbon_credit.py
│   ├── services/               # Business logic
│   │   ├── firewatch/
│   │   │   ├── detector.py     # Fire detection logic
│   │   │   ├── alerting.py     # Alert management
│   │   │   └── satellite.py    # Earth Engine integration
│   │   ├── stubble/
│   │   │   ├── matcher.py      # Farm-plant matching
│   │   │   ├── optimizer.py    # Route optimization
│   │   │   └── dispatcher.py   # Dispatch logic
│   │   └── carbon/
│   │       ├── calculator.py   # Credit calculation
│   │       ├── verifier.py     # Verification logic
│   │       └── monetizer.py    # Monetization
│   ├── tasks/                  # Celery tasks
│   │   ├── celery_app.py
│   │   ├── satellite_tasks.py
│   │   ├── routing_tasks.py
│   │   ├── carbon_tasks.py
│   │   └── notification_tasks.py
│   ├── repositories/           # Data access layer
│   ├── utils/                  # Utilities
│   │   ├── whatsapp.py         # WhatsApp integration
│   │   ├── geo.py              # Geospatial utilities
│   │   └── i18n.py             # Translations (Punjabi)
│   └── main.py                 # FastAPI application
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── requirements/
    └── base.txt
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

# Run Celery beat (scheduler)
celery -A app.tasks.celery_app beat -l info
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| API Framework | FastAPI 0.109+ |
| Database | PostgreSQL 16 + PostGIS 3.4 + TimescaleDB 2.14 |
| Cache/Queue | Redis 7 |
| Background Tasks | Celery 5.3+ |
| Satellite Data | Google Earth Engine API |
| Messaging | WhatsApp Business API |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| ASGI Server | Uvicorn/Gunicorn |
| Monitoring | Prometheus + Grafana |
| Task Monitoring | Flower |

## Key Calculations

### Carbon Credit Calculation

```
CO2e Averted (tons) = Stubble (tons) × 2.5

Credit Amount (tons) = CO2e Averted × 0.95 (efficiency)

Estimated Value = Credit Amount × ₹2,500/ton
```

### Route Optimization

```
Distance = Haversine formula (geodesic)

Transport Cost = Distance (km) × ₹15/km

Total Cost = Transport Cost + (Stubble × ₹500/ton)
```

### Earnings Distribution

```
Farmer Share: 60% of carbon credit sale
Plant Share:   30% of carbon credit sale
Platform:      10% of carbon credit sale
```
