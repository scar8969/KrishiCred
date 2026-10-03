# KrishiCred

> Turning stubble burning into carbon farming revenue.

An AI climate-finance platform that detects crop-residue burning via satellite, routes stubble to biogas plants through WhatsApp, and monetizes farmers' climate-positive behavior through carbon credits.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Google Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-4285F4?logo=googleearth&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎯 Problem

Punjab farmers burn **20 million tons** of paddy stubble each October because clearing costs exceed benefits. This contributes up to **44% of Delhi's winter air pollution**, with health costs estimated at **$30B annually**.

Current solutions — subsidies, fines, and awareness campaigns — fail because they don't address the fundamental economics: farmers lose money by *not* burning.

## 💡 Solution

KrishiCred is a **three-sided marketplace** where:
1. **Farmers** earn more by selling stubble than burning it
2. **Biogas plants** get optimized, low-cost feedstock supply
3. **Carbon buyers** purchase verified credits from emission reductions

## 🧩 Core Modules

| Module | Function |
|--------|----------|
| **FireWatch AI** | Real-time satellite fire detection + Punjabi WhatsApp alerts |
| **StubbleRoute** | Farm-to-plant matching with dynamic routing optimization |
| **CarbonLedger** | Satellite-verified carbon credit generation and marketplace |

## 🚀 Quick Start

```bash
git clone git@github.com:scar8969/KrishiCred.git
cd KrishiCred

# Backend
cd krishicred_backend
pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Or use the project Makefile:

```bash
make start      # start backend + frontend
make stop       # stop all services
make dev        # dev mode with live reload
make status     # service status
make logs       # tail service logs
make clean      # kill lingering processes
```

## 📚 Documentation

- [One-Page Pitch](docs/01-one-page-pitch.md)
- [Complete Blueprint](docs/02-complete-blueprint.md)
- [Technical Architecture](docs/03-technical-architecture.md)
- [Business Model](docs/04-business-model.md)
- [Go-to-Market Strategy](docs/05-go-to-market.md)

## 🛠 Tech Stack

- **Python 3.11+** · FastAPI · SQLAlchemy · Alembic
- **Google Earth Engine** · rasterio (satellite fire detection)
- **OR-Tools** (routing optimization) · Celery · Redis
- **PostgreSQL** + PostGIS (GeoAlchemy2)
- WhatsApp Business API · Web3 (future Polygon integration)

## 📈 Why Now

- India's new Carbon Credit Trading Scheme (2023) creates regulatory certainty
- Satellite costs have fallen 90% in 5 years
- CBG (Compressed Biogas) rollout creates feedstock demand
- Punjab has 90% smartphone penetration and WhatsApp adoption

## 💰 The Economics

| Option | Farmer Net (per acre) |
|--------|----------------------|
| **Burn** | ₹0 |
| **Sell stubble (without carbon)** | ₹(-400) to ₹0 |
| **Sell stubble + KrishiCred carbon credits** | **₹+2,600** |

## 🗺 Roadmap

| Phase | Timeline | Target |
|-------|----------|--------|
| **MVP** | 90 days | 2,000 farmers, 10,000 tons diverted |
| **Pilot** | 6 months | 50,000 farmers, 500K tons diverted |
| **Scale Punjab** | 18 months | 250K farmers, first carbon credits issued |
| **Pan-India** | 36 months | 2M tons diverted (10% of North India) |

## 🤝 Contributing

We're seeking collaborators in satellite engineering, full-stack development, agronomy, and carbon markets. [Open an issue](https://github.com/scar8969/KrishiCred/issues) for collaboration inquiries.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Turning Pollution into Profit.*