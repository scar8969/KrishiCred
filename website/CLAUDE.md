# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KrishiCred is a React-based web application for agricultural stubble management in Punjab, India. The platform helps farmers monetize crop residue instead of burning it, using satellite-based fire detection and carbon credit trading.

**Key Features:**
- Government dashboard for real-time fire monitoring across Punjab districts
- Plant operations interface for biogas collection routing
- Live fire map with satellite detection
- Carbon marketplace for trading verified credits
- Multilingual support (English, Punjabi, Hindi)

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Build Tool:** Vite 5
- **Framework:** React 18 with React Router DOM 6
- **Styling:** Tailwind CSS 3 with custom "Harvest Horizon" design system
- **State Management:** Zustand 4 (persistent auth store, ephemeral fire/marketplace/demo stores)
- **Data Visualization:** Recharts (charts), Leaflet (maps)
- **Icons:** Lucide React, Material Symbols Outlined
- **Fonts:** Plus Jakarta Sans (headlines), Be Vietnam Pro (body/labels), Noto Sans Gurmukhi (Punjabi)

## Architecture

### State Management (Zustand Stores)

Located in `src/stores/index.js`:

- **useAuthStore** - User authentication with localStorage persistence (`krishicred-auth` key)
- **useFireStore** - Fire incidents, filters, and statistics
- **useMarketplaceStore** - Carbon credit listings, cart, filters
- **useUIStore** - Sidebar, mobile menu, modals, toasts
- **useDemoStore** - Multi-step demo flow, chat messages, khasra selection

### Pseudo Database

`src/services/pseudoDatabase.js` provides comprehensive mock data for development:
- Punjab district data (23 districts with coordinates)
- Farmer generation with land area, khasra numbers
- Biogas plant locations and capacity
- Fire incidents with severity/status
- Carbon credits with verification workflow
- Collection route generation
- WhatsApp conversation templates

### Component Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, StatCard, Chip, ProgressBar)
│   ├── layout/      # Navigation, TopAppBar, BottomNav
│   └── [feature]    # Feature-specific components (FireMap, ChatDemo, ImpactCalculator)
├── pages/           # Route-level pages (HomePage, GovernmentDashboard, PlantDashboard, etc.)
└── main.jsx         # App entry point with BrowserRouter
```

### Design System

The app uses a custom "Harvest Horizon" theme defined in `tailwind.config.js`:

**Primary Colors:**
- Primary: `#006c49` (green)
- Secondary: `#855300` (earth/brown)
- Tertiary: `#b91a24` (red for fires)

**Typography Scale:** Display-large (57px) down to Label-small (11px)

**Border Radius:** Card (1rem), Dialog (2rem), Shape (3rem), Full

**Custom Animations:** float, pulse-fire, gradient-x, shimmer, fade-in, slide-up

### Routing

Routes defined in `src/App.jsx`:
- `/` - HomePage (landing)
- `/government` - GovernmentDashboard
- `/plant` - PlantDashboard
- `/fire` - FireMonitorPage
- `/account` - AccountPage
- `/about` - AboutPage
- `/marketplace` - CarbonMarketplace
- `/premium` - PremiumLandingPage

## Data Models

Key data structures from pseudoDatabase:
- **District**: id, name, namePa (Punjabi), lat/lng, farms count, fires_today
- **Fire**: id, districtId, severity (low/medium/high/critical), status (active/responding/contained/resolved), location, detectedAt
- **BiogasPlant**: id, name, operator, district, capacity (daily tons), storage, pricePerTon, status
- **CarbonCredit**: id, stubbleTons, baselineEmissions, netReductions, netCredits, verificationStatus, buyerId
- **StubbleListing**: id, farmerId, districtId, cropType, quantity, pricePerTon, status

## External Dependencies

- Leaflet CSS is loaded via CDN in `index.html`
- Google Fonts (Plus Jakarta Sans, Be Vietnam Pro, Noto Sans Gurmukhi, Material Symbols) loaded in `index.html`

## Key Considerations

1. **Multilingual**: Many components support Punjabi translations via `namePa` fields
2. **Punjab Geography**: All data is Punjab-specific with 23 districts
3. **Carbon Credits**: Calculated as ~0.6 credits per ton of stubble, priced ~INR 380-460 per credit
4. **Fire Detection**: Mock satellite data with confidence scores and severity levels
5. **WhatsApp Integration**: Conversation templates for farmer onboarding flow
