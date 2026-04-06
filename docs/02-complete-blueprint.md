# Complete Startup Blueprint: KrishiCred

---

## Table of Contents

1. [Problem Framing](#1-problem-framing)
2. [Product Vision](#2-product-vision)
3. [User Journeys](#3-user-journeys)
4. [MVP Plan](#4-mvp-plan)
5. [Technical Architecture](#5-technical-architecture)
6. [Business Model](#6-business-model)
7. [Go-to-Market](#7-go-to-market)
8. [Risks & Constraints](#8-risks-constraints)
9. [Differentiation](#9-differentiation)
10. [Execution Plan](#10-execution-plan)

---

## 1. Problem Framing

### The Pain Point

```
PUNJAB STUBBLE BURNING CRISIS
├── Scale: 20M tons burned annually
├── Timing: 15-day window (late October)
├── Impact: 44% of Delhi's winter pollution
├── Health cost: $30B annually
└── Economic loss: ₹2,000/acre in soil nutrients
```

### Why Current Solutions Fail

| Solution | Why It Fails |
|----------|--------------|
| **Fines & Enforcement** | Politically sensitive; impossible to monitor 2.5M+ farms |
| **Happy Seeder Subsidy** | ₹40,000+ machine cost; labor skill gap |
| **Awareness Campaigns** | Farmers know it's harmful; they burn because alternatives cost more |
| **Bio-CPP Plants** | Poor logistics; collection costs eat margins |
| **Ex-Sita Baler Procurement** | Machines sit idle 11 months/year |

### The Fundamental Economic Mismatch

```
Farmer's Cost Calculation (per acre):

Option A: BURN
  Cost: ₹0 (just matchstick)
  Time: 1 day
  Risk: Low (fine = ₹2,500, rarely enforced)
  Net: ₹0

Option B: BALE & TRANSPORT (without KrishiCred)
  Baler rental: ₹800
  Labor: ₹600
  Transport: ₹1,200
  Time: 3-4 days (critical delay for wheat)
  Payment: ₹1,500-2,000 (often delayed)
  Net: ₹(-400) to ₹0

Option C: KCRISHICRED
  Stubble sale: ₹2,200
  Carbon credit: ₹800
  Net: ₹3,000 profit
```

---

## 2. Product Vision

### Platform Definition

**KrishiCred** is an AI-powered climate finance platform that verifies and monetizes sustainable farm practices while optimizing agricultural waste logistics.

### Core Modules

| Module | Function | Value Proposition |
|--------|----------|-------------------|
| **FireWatch AI** | Real-time satellite fire detection; Farm-level alerts; Punjabi WhatsApp notifications | Early intervention; behavioral feedback |
| **StubbleRoute** | Farm-to-plant matching; Dynamic routing by capacity, price, distance; Collection scheduling | Maximizes earnings; minimizes costs |
| **CarbonLedger** | Satellite verification; Blockchain-based credits; Direct buyer marketplace | New revenue stream; auditable proof |

---

## 3. User Journeys

### Farmer Journey

```
Day 1: Rice Harvest Complete
└─ WhatsApp: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ Ram Ji. Your stubble is ready.
              Sell to Satnam BioEnergy for ₹2,200/acre.
              Pickup: Oct 26. Tap to confirm."

Day 2-4: Before Burning Urgency
└─ WhatsApp: "Fire detected 2km away. Don't burn—your pickup is confirmed"

Day 5: Collection & Payment
└─ Ram receives ₹2,200 via UPI instantly
   App shows: "₹400 carbon credit processing"

Day 30: Credit Realization
└─ WhatsApp: "₹400 carbon credit received! Total earned: ₹2,600"
```

### Government Journey

```
Pre-Kharif: Dashboard shows district-wise hotspots
During Season: Real-time fire map; response coordination
Post-Season: Impact report; carbon credit verification
```

### Biogas Plant Journey

```
Pre-Season: Input demand; supply availability confirmation
During Season: Real-time pickup schedule; quality tracking
End Season: 98% fulfillment vs 65% pre-KrishiCred
```

### Carbon Credit Buyer Journey

```
Pre-Purchase: Marketplace; credit verification
Due Diligence: Transparency; additionality; permanence
Purchase: Contract; impact report; storytelling
Post-Purchase: Annual monitoring; renewal
```

---

## 4. MVP Plan (90 Days)

### Sprint 1: Days 1-30

| Deliverable | Manual/Auto |
|-------------|-------------|
| 50 farmer interviews across 3 districts | Manual |
| LOI with 2 CBG plants | Manual |
| Satellite data pipeline prototype | Auto |
| WhatsApp fire alert bot | Semi-auto |

**Metrics:** 100 farmers on WhatsApp; 1 plant partner; >80% fire detection accuracy

### Sprint 2: Days 31-60

| Deliverable | Manual/Auto |
|-------------|-------------|
| Farm registration via WhatsApp | Semi-auto |
| Basic farm-to-plant matching | Semi-auto |
| Village-level fire alerts | Auto |
| Carbon calculator prototype | Manual |

**Metrics:** 500 farmers; 1,000 tons stubble routed; <5% burning among users

### Sprint 3: Days 61-90

| Deliverable | Manual/Auto |
|-------------|-------------|
| Dynamic routing engine | Auto |
| UPI instant payments | Auto |
| Satellite verification | Auto |
| Carbon credit pre-sales LOI | Manual |

**Metrics:** 2,000 farmers; 10,000 tons diverted; 1,500 tons CO2e verified

### Data Sources Required

| Data Type | Source | Cost |
|-----------|--------|------|
| Fire Detection | NASA MODIS, VIIRS; Sentinel-3 | Free |
| Field Boundaries | Punjab Land Records Society API | Free (MoU) |
| Crop Type | Sentinel-2 NDVI | Free |
| Plant Locations | SATAT database + primary | Free |
| Weather | IMD API | Free |

---

## 5. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KRISHICRED PLATFORM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      FARMER INTERFACE                        │  │
│  │   WhatsApp Bot (Punjabi) │ Voice IVR │ Field Agent App      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API GATEWAY                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CORE SERVICES                              │  │
│  │  FireWatch Engine │ Stubble Router │ Carbon Verifier        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     DATA LAYER                                │  │
│  │  Satellite DB │ Farm Registry │ Transaction Ledger          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  STAKEHOLDER APPS                            │  │
│  │  Plant Dashboard │ Gov Monitor │ Carbon Buyer Portal         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Backend | Python (FastAPI) | Satellite ecosystem |
| Satellite Processing | Google Earth Engine + AWS Batch | Scalable geospatial |
| Database | PostgreSQL + PostGIS + TimescaleDB | Spatial + time-series |
| Messaging | WhatsApp Business API + JioVoice | 95%+ reach |
| Routing | Google OR-Tools + OpenStreetMap | Vehicle optimization |
| Blockchain | Polygon | Transparent ledger |
| Frontend | React + Mapbox GL | Responsive dashboards |
| Infrastructure | AWS (Mumbai) | Compliance + latency |

---

## 6. Business Model

### Revenue Streams

| Stream | Mechanics | Margins |
|--------|-----------|---------|
| Transaction Fee | ₹50/ton on stubble routed | 18% |
| Carbon Commission | 15% on credit sales | 85% |
| SaaS Fee | ₹50,000/year for plants | 90% |
| Govt Data License | Anonymous burning data | 95% |
| ESG Premium | Certified labels | N/A |

### Unit Economics (Per Acre)

| Parameter | Value |
|-----------|-------|
| Stubble generated | 4 tons |
| Total farmer revenue | ₹3,000 |
| KrishiCred revenue | ₹230/acre |
| KrishiCred costs | ₹80/acre |
| **KrishiCred margin** | **₹150/acre (65%)** |

### Market Scale

| Metric | Value |
|--------|-------|
| Total paddy area (Punjab) | 30 lakh hectares |
| Addressable (10%) | 3 lakh hectares |
| Revenue @ ₹230/acre | ₹69 cr/year |

---

## 7. Go-to-Market

### Pilot Design (Year 1)

| District | Rationale | Target |
|----------|-----------|--------|
| Ludhiana | High burning; near CBG plants | 1,000 farmers |
| Sangrur | Progressive farmers | 800 farmers |
| Bathinda | High biogas concentration | 700 farmers |

### First 3 Segments

| Segment | Value Prop | Channel |
|---------|------------|---------|
| CBG Plant Owners | Guaranteed feedstock | Direct sales |
| Large Farmers (10+ acres) | Higher absolute earnings | WhatsApp groups |
| FPOs | Bulk coordination | MoU with federation |

### Critical Partnerships

| Partner | Value |
|---------|-------|
| Punjab Agriculture Dept | Regulatory cover |
| Punjab State Council for S&T | Satellite data access |
| Jio Platforms | WhatsApp API concessions |
| Carbon Registry | Methodology approval |
| Tractor OEMs | Distribution leverage |

### Rollout Strategy

```
Phase 1 (1-6 months):   2,500 farmers | 3 plants | 50K tons
Phase 2 (7-18 months):  50,000 farmers | 20 plants | 500K tons
Phase 3 (19-36 months): 250,000 farmers | Pan-India | 2M tons
```

---

## 8. Risks & Constraints

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Farmer Adoption | Medium | High | Punjabi UI; voice IVR; UPI payments |
| Satellite Data | Low | Medium | Multi-source; ground truth |
| Policy Changes | Medium | High | State diversification; advocacy |
| Carbon Credibility | Medium | High | Third-party validation |
| Plant Default | Medium | Medium | Escrow; insurance |

### Key Constraints

| Constraint | Implication | Workaround |
|------------|-------------|------------|
| 15-day window | Operations spike | Pre-book capacity |
| Monsoon | Satellite visibility | SAR radar + ground |
| Fragmented holdings | High per-acre cost | FPO aggregation |

---

## 9. Differentiation

### vs. Competitors

| Company | Focus | KrishiCred Difference |
|---------|-------|----------------------|
| nurture.farm | Input sales | Carbon verification + marketplace |
| DeHaat | Agri-commerce | Climate-focused, satellite-backed |
| KhetiGaadi | Equipment rental | Stubble routing, carbon |
| Ecozens | Supply chain | Farmer interface |

### Defensibility

1. **Data Moat**: 5-year satellite history per farm
2. **Network Effects**: More farmers → better routing → better prices
3. **Regulatory Assets**: 12-24 month methodology approval moat
4. **Switching Costs**: Instant payments; plant supply dependence

---

## 10. Execution Plan

### 6-Month Roadmap

```
Month 1: Foundation
├─ Incorporation, hiring (CTO, Satellite Engineer, Field Ops)
├─ AWS setup, dev environment
└─ LOI from 1 CBG plant

Month 2: Data Pipeline
├─ Satellite ingestion (NASA + ESA)
├─ Farm boundary integration
├─ Fire detection model
└─ WhatsApp API integration

Month 3: MVP Build
├─ Farmer registration bot (Punjabi)
├─ Matching algorithm
├─ Plant dashboard
└─ UPI integration

Month 4: Pilot Prep
├─ Field agent hiring
├─ Farmer onboarding
├─ Plant onboarding
└─ End-to-end testing

Month 5: Live Pilot
├─ First fire alerts
├─ First stubble collection
├─ First payment
└─ Feedback iteration

Month 6: Review & Plan
├─ Impact analysis
├─ Financial review
├─ Carbon methodology draft
└─ Series A preparation
```

### Team Roles Needed

| Role | Priority | Skills |
|------|----------|--------|
| Satellite Engineer | P0 | Remote sensing, GEE, Python |
| Full Stack Developer | P0 | Python/React, WhatsApp API |
| Agronomist (Punjab) | P0 | Local crops, farmer networks |
| Carbon Specialist | P1 | Verra/Gold Standard, MRV |
| Field Operations Lead | P1 | Rural ops, fleet mgmt |
| Policy/Gov Relations | P2 | Punjab agri dept experience |
| Growth Marketer | P2 | Rural marketing, WhatsApp |

### Key Milestones

| Milestone | Date | Metric |
|-----------|------|--------|
| Seed Round Close | Month 3 | ₹6 cr raised |
| First Fire Alert | Month 4 | 100 farmers |
| First Stubble Sale | Month 5 | 10 tons |
| Carbon Methodology Filed | Month 6 | Submitted |
| First Credit Issuance | Month 12 | 10K tons CO2e |
| Series A Ready | Month 18 | 50K farmers |

---

## Appendix: Carbon Credit Calculation

```
Farm: 5 acres, Ludhiana

BASELINE (Without KrishiCred):
  Stubble: 20 tons
  Burning emissions: 50 tons CO2e
  Methane: 8 tons CO2e
  TOTAL: 58 tons CO2e

PROJECT SCENARIO (With KrishiCred):
  Collection emissions: -1.2 tons CO2e
  Biogas displacement: -15 tons CO2e
  Fertilizer displacement: -2 tons CO2e
  NET: -15.8 tons CO2e

CREDITS: 58 - (-15.8) = 73.8 tons CO2e
Buffer (20%): 14.8 tons
NET CREDITS: 59 tons CO2e
VALUE @ ₹400/ton: ₹23,600
Farmer share (70%): ₹16,520
KrishiCred share (30%): ₹7,080
```

---

*Last updated: April 2026*
