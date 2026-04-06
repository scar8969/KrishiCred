# Technical Architecture

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KRISHICRED PLATFORM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          FARMER INTERFACE                            │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │ WhatsApp Bot │  │ Voice (IVR) │  │ Field Agent App         │   │   │
│  │  │ (Punjabi)    │  │ (Illiterate)│  │ (Backup/Verification)   │   │   │
│  │  └─────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           API GATEWAY                                │   │
│  │                    (Rate Limiting, Auth, Routing)                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CORE SERVICES                                 │   │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐  │   │
│  │  │  FIREWATCH ENGINE │ │ STUBBLE ROUTER    │ │ CARBON VERIFIER   │  │   │
│  │  │ - Satellite ingest│ │ - Matching algo   │ │ - Baseline comp.  │  │   │
│  │  │ - Hotspot detect  │ │ - Route optim.    │ │ - Additionality   │  │   │
│  │  │ - Alert dispatch  │ │ - Fleet sched.    │ │ - Credit calc.    │  │   │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                   │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────┐  │   │
│  │  │   Satellite DB   │ │   Farm Registry  │ │  Transaction Ledger │  │   │
│  │  │ (PostGIS Timeseries)│  (PostgreSQL)   │ │   (Blockchain/IPFS) │  │   │
│  │  └──────────────────┘ └──────────────────┘ └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       STAKEHOLDER APPS                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │ Plant Dashboard│ │ Govt Monitor │  │ Carbon Buyer Portal     │   │   │
│  │  │ - Supply view │ │ - Fire map   │  │ - Credit marketplace    │   │   │
│  │  │ - Fleet track │ │ - Compliance │  │ - Impact reports        │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

EXTERNAL INTEGRATIONS:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ NASA/ESA     │  │ Punjab Land  │  │ UPI/PhonePe  │  │ Carbon Registry│
│ Satellite APIs│  │ Records API  │  │ Payment      │  │ (Verra/Gold)  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Technology Stack

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| API Framework | FastAPI | Latest |
| Language | Python | 3.11+ |
| Task Queue | Celery + Redis | Latest |
| Message Broker | Redis | 7.x |

### Satellite Processing

| Component | Technology | Purpose |
|-----------|------------|---------|
| Cloud Platform | Google Earth Engine | Satellite imagery |
| Batch Processing | AWS Batch | Scalable jobs |
| Storage | AWS S3 + Glacier | Raw + archived data |
| CDN | CloudFront | Tile delivery |

### Database

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary | PostgreSQL 15+ | Relational data |
| Geospatial | PostGIS 3.3+ | Spatial queries |
| Time-series | TimescaleDB | Fire/temporal data |
| Cache | Redis | Hot data |
| Search | Elasticsearch | Farm/credit search |

### Messaging

| Component | Technology | Purpose |
|-----------|------------|---------|
| WhatsApp | Meta Business API | Primary farmer channel |
| Voice IVR | Jio/Samsung | Illiterate farmers |
| SMS | MSG91 | Fallback channel |
| Email | SendGrid | Corporate stakeholders |

### Blockchain

| Component | Technology | Purpose |
|-----------|------------|---------|
| Network | Polygon | Low gas fees |
| Storage | IPFS | Off-chain data |
| Bridge | Chainlink | External data feeds |

### Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18 | UI |
| State | Zustand | State management |
| Maps | Mapbox GL JS | Geospatial viz |
| Charts | Recharts | Analytics |
| Mobile | React Native | Field agent app |

### Infrastructure

| Component | Technology | Region |
|-----------|------------|--------|
| Cloud | AWS | Mumbai (ap-south-1) |
| Container | ECS + Fargate | Compute |
| Serverless | Lambda | Burst workloads |
| CDN | CloudFront | Global |
| DNS | Route53 | Domain |
| Monitoring | CloudWatch + Sentry | Observability |

---

## Core Algorithms

### 1. Fire Detection

```python
from typing import List, Tuple
import ee
from ee import batch

class FireDetectionEngine:
    """
    Real-time fire detection using satellite thermal anomaly data.
    Sources: NASA MODIS, VIIRS; ESA Sentinel-3 SLSTR
    """

    def __init__(self):
        self.ee = ee.Initialize()
        self.threshold_k = 325  # Kelvin
        self.confidence = 0.8

    def detect_hotspots(
        self,
        region: ee.Geometry,
        start_date: str,
        end_date: str
    ) -> ee.FeatureCollection:
        """Detect thermal anomalies in specified region."""
        # Get MODIS thermal bands
        modis = (
            ee.ImageCollection("MODIS/006/MOD14A1")
            .filterDate(start_date, end_date)
            .filterBounds(region)
        )

        # Thermal anomaly filter
        hotspots = modis.map(lambda img: (
            img.select('MaxFRP')
            .gt(self.threshold_k)
            .selfMask()
            .copyProperties(img, ['system:time_start'])
        ))

        return hotspots

    def filter_by_context(
        self,
        hotspots: ee.FeatureCollection,
        crop_mask: ee.Image,
        harvest_date: str
    ) -> ee.FeatureCollection:
        """Apply contextual filters to reduce false positives."""
        # Filter by rice crop
        rice_areas = crop_mask.eq(3)  # Rice class ID

        # Filter by harvest window (0-20 days post-harvest)
        days_since_harvest = (
            ee.Date(harvest_date)
            .difference(ee.Date(start_date), 'day')
            .abs()
        )
        harvest_window = days_since_harvest.lte(20)

        # Combine filters
        filtered = hotspots.filterBounds(rice_areas)
        filtered = filtered.filter(harvest_window)

        return filtered

    def attribute_to_farms(
        self,
        hotspots: ee.FeatureCollection,
        farm_boundaries: ee.FeatureCollection
    ) -> ee.FeatureCollection:
        """Map hotspots to farm boundaries."""
        return hotspots.map(lambda hotspot: (
            farm_boundaries
            .filterBounds(hotspot.geometry())
            .first()
            .set({'fire_detected': True, 'detection_time': hotspot.get('system:time_start')})
        ))

    def calculate_risk_score(
        self,
        farm: ee.Feature,
        proximity_weight: float = 0.4,
        historical_weight: float = 0.3,
        weather_weight: float = 0.3
    ) -> float:
        """Calculate burning risk score for a farm."""
        # Proximity to recent burns
        nearby_burns = self.count_nearby_burns(farm, radius_km=5)
        proximity_score = min(nearby_burns / 10, 1.0)

        # Historical burning rate
        historical_rate = self.get_historical_burning_rate(farm, years=3)

        # Weather conditions (low humidity + low wind = high risk)
        weather_score = self.get_fire_weather_score(farm)

        return (
            proximity_score * proximity_weight +
            historical_rate * historical_weight +
            weather_score * weather_weight
        )
```

### 2. Stubble Routing

```python
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import math

class StubbleRoutingEngine:
    """
    Optimizes stubble collection from farms to biogas plants.
    Uses Google OR-Tools for vehicle routing optimization.
    """

    def __init__(self):
        self.distance_matrix = None
        self.demands = None
        self.vehicle_capacities = None

    def build_distance_matrix(
        self,
        farms: List[dict],
        plants: List[dict]
    ) -> List[List[int]]:
        """Build distance/time matrix between all nodes."""
        nodes = farms + plants
        n = len(nodes)
        matrix = [[0] * n for _ in range(n)]

        for i in range(n):
            for j in range(n):
                if i != j:
                    matrix[i][j] = self.get_road_distance(
                        nodes[i]['lat'], nodes[i]['lon'],
                        nodes[j]['lat'], nodes[j]['lon']
                    )

        return matrix

    def optimize_routes(
        self,
        farms: List[dict],
        plants: List[dict],
        balers: List[dict],
        time_windows: List[Tuple[int, int]]
    ) -> List[dict]:
        """
        Optimize collection routes with constraints:
        - Plant capacity constraints
        - Baler availability windows
        - Farm access restrictions
        """
        # Create routing index manager
        manager = pywrapcp.RoutingIndexManager(
            len(self.distance_matrix),
            len(balers),
            [0] * len(balers)  # Start nodes
        )

        routing = pywrapcp.RoutingModel(manager)

        # Create distance callback
        def distance_callback(i, j):
            return self.distance_matrix[manager.IndexToNode(i)][manager.IndexToNode(j)]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Add capacity constraints
        def demand_callback(i):
            node = manager.IndexToNode(i)
            return farms[node].get('stubble_tons', 0) if node < len(farms) else 0

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)

        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            [b['capacity_tons'] for b in balers],
            True,  # start cumul to zero
            'Capacity'
        )

        # Add time window constraints
        routing.AddDimension(
            transit_callback_index,
            30,  # waiting time
            480,  # max time per vehicle (8 hours)
            False,  # don't force start cumul to zero
            'Time'
        )

        time_dimension = routing.GetDimensionOrDie('Time')
        for i, (earliest, latest) in enumerate(time_windows):
            index = routing.NodeToIndex(i)
            time_dimension.CumulVar(index).SetRange(earliest, latest)

        # Set objective: minimize total distance
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Solve
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        solution = routing.SolveWithParameters(search_parameters)

        return self.extract_routes(solution, routing, manager)

    def calculate_cost(
        self,
        route: List[dict],
        baler_cost_per_km: float = 25,
        farmer_price_per_ton: float = 275
    ) -> dict:
        """Calculate route economics."""
        total_distance = sum(r['distance_km'] for r in route)
        total_tons = sum(r['stubble_tons'] for r in route)

        collection_cost = total_distance * baler_cost_per_km
        farmer_payment = total_tons * farmer_price_per_ton

        return {
            'total_distance_km': total_distance,
            'total_tons': total_tons,
            'collection_cost': collection_cost,
            'farmer_payment': farmer_payment,
            'net_cost': collection_cost - farmer_payment
        }
```

### 3. Carbon Credit Calculation

```python
class CarbonCreditCalculator:
    """
    Calculates verified carbon credits from stubble diversion.
    Based on IPCC Guidelines and Verra VM0044 methodology.
    """

    # Emission factors (tons CO2e per ton stubble)
    EMISSION_FACTORS = {
        'burning_co2': 2.5,      # CO2 from combustion
        'burning_ch4': 0.05,      # Methane from incomplete combustion
        'ch4_gwp': 28,            # Methane GWP (IPCC AR6)
        'collection_diesel': 0.003,  # Diesel per km per ton
        'diesel_ef': 2.68,        # CO2e per liter diesel
    }

    def __init__(self, stubble_tons: float, area_acres: float):
        self.stubble_tons = stubble_tons
        self.area_acres = area_acres

    def calculate_baseline_emissions(self) -> float:
        """Calculate emissions if stubble was burned."""
        burning_emissions = (
            self.stubble_tons * self.EMISSION_FACTORS['burning_co2']
        )
        methane_emissions = (
            self.stubble_tons *
            self.EMISSION_FACTORS['burning_ch4'] *
            self.EMISSION_FACTORS['ch4_gwp']
        )
        return burning_emissions + methane_emissions

    def calculate_project_emissions(
        self,
        collection_distance_km: float,
        plant_grid_kwh: float = 50
    ) -> float:
        """Calculate emissions from collection and processing."""
        # Collection emissions (diesel)
        collection_emissions = (
            self.stubble_tons *
            collection_distance_km *
            self.EMISSION_FACTORS['collection_diesel'] *
            self.EMISSION_FACTORS['diesel_ef']
        )

        # Processing emissions (grid electricity)
        grid_ef = 0.82  # India grid emission factor
        processing_emissions = plant_grid_kwh * grid_ef

        return collection_emissions + processing_emissions

    def calculate_emission_reductions(
        self,
        biogas_lpg_displaced_tons: float = 0,
        digestate_fertilizer_displaced_tons: float = 0
    ) -> float:
        """Calculate total emission reductions."""
        baseline = self.calculate_baseline_emissions()
        project = self.calculate_project_emissions()

        # Avoided emissions from displacement
        lpg_ef = 3.0  # tons CO2e per ton LPG
        urea_ef = 1.5  # tons CO2e per ton urea

        displacement_reductions = (
            biogas_lpg_displaced_tons * lpg_ef +
            digestate_fertilizer_displaced_tons * urea_ef
        )

        return baseline - project + displacement_reductions

    def calculate_net_credits(
        self,
        buffer_percentage: float = 20.0
    ) -> dict:
        """Calculate net credits after buffer."""
        emission_reductions = self.calculate_emission_reductions()

        # Apply conservative buffer
        buffer = emission_reductions * (buffer_percentage / 100)
        net_credits = emission_reductions - buffer

        return {
            'gross_emission_reductions_tco2e': emission_reductions,
            'buffer_tco2e': buffer,
            'net_credits_tco2e': net_credits,
            'credits_per_ton_stubble': net_credits / self.stubble_tons,
        }
```

---

## Data Models

### Farm Registry

```sql
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    khasra_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id UUID REFERENCES farmers(id),
    village_id UUID REFERENCES villages(id),
    district_id UUID REFERENCES districts(id),

    -- Spatial data
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    area_acres DECIMAL(10, 2) NOT NULL,
    soil_type VARCHAR(50),

    -- Crop data
    current_crop VARCHAR(50),
    planting_date DATE,
    expected_harvest_date DATE,
    expected_stubble_tons DECIMAL(10, 2),

    -- Status
    krishicred_enrolled BOOLEAN DEFAULT FALSE,
    enrollment_date DATE,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_farms_boundary (boundary),
    INDEX idx_farms_district (district_id),
    INDEX idx_farms_enrollment (krishicred_enrolled)
);
```

### Satellite Events

```sql
CREATE TABLE satellite_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,  -- 'fire_detected', 'harvest_detected', etc.

    -- Spatial
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    affected_farms UUID[] REFERENCES farms(id),

    -- Temporal
    detected_at TIMESTAMP NOT NULL,
    satellite_source VARCHAR(50) NOT NULL,
    processing_time TIMESTAMP DEFAULT NOW(),

    -- Event data
    confidence DECIMAL(5, 4),
    intensity DECIMAL(10, 2),
    area_ha DECIMAL(10, 2),

    -- Metadata
    raw_data JSONB,

    INDEX idx_satellite_events_location (location),
    INDEX idx_satellite_events_time (detected_at),
    INDEX idx_satellite_events_type (event_type)
);
```

### Carbon Credits

```sql
CREATE TABLE carbon_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL,

    -- Origin
    farm_id UUID REFERENCES farms(id),
    stubble_tons DECIMAL(10, 2) NOT NULL,

    -- Calculation
    baseline_emissions_tco2e DECIMAL(10, 2) NOT NULL,
    project_emissions_tco2e DECIMAL(10, 2) NOT NULL,
    net_reductions_tco2e DECIMAL(10, 2) NOT NULL,
    buffer_tco2e DECIMAL(10, 2) NOT NULL,
    net_credits_tco2e DECIMAL(10, 2) NOT NULL,

    -- Verification
    verification_method VARCHAR(50) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by UUID,
    verified_at TIMESTAMP,

    -- Blockchain
    transaction_hash VARCHAR(100),
    block_number BIGINT,

    -- Sales
    buyer_id UUID,
    sale_price_inr DECIMAL(12, 2),
    sale_date DATE,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_carbon_credits_batch (batch_id),
    INDEX idx_carbon_credits_status (verification_status),
    INDEX idx_carbon_credits_farm (farm_id)
);
```

---

## API Endpoints

### Farmer APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/farmers/register` | POST | Register new farmer |
| `/api/v1/farmers/{id}/stubble` | POST | Report stubble ready |
| `/api/v1/farmers/{id}/offers` | GET | Get buyer offers |
| `/api/v1/farmers/{id}/accept` | POST | Accept offer |
| `/api/v1/farmers/{id}/payments` | GET | Get payment history |

### Plant APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/plants/demand` | POST | Submit feedstock demand |
| `/api/v1/plants/schedule` | GET | Get pickup schedule |
| `/api/v1/plants/incoming` | GET | Track incoming stubble |
| `/api/v1/plants/quality` | POST | Report quality metrics |

### Carbon APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/calculate` | POST | Calculate credit estimate |
| `/api/v1/verify` | POST | Submit verification request |
| `/api/v1/credits/marketplace` | GET | Browse available credits |
| `/api/v1/credits/{id}/purchase` | POST | Purchase credits |

---

*Last updated: April 2026*
