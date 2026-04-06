# KrishiCred - Stitch Assets Summary

## Downloaded Assets

### Location
`/home/krs_jetson/Desktop/Link1/stitch_assets`

### Contents

#### 1. Screens (7 screenshots)
| Screen | Image File |
|-------|-----------|
| Plant Flow Diagram | `Plant Flow Diagram_screenshot.png` |
| Farmer Flow Diagram | `Farmer Flow Diagram_screenshot.png` |
| Government Flow Diagram | `Government Flow Diagram_screenshot.png` |
| KrishiCred Home | `KrishiCred Home_screenshot.png` |
| KrishiCred Government Monitor | `KrishiCred Government Monitor_screenshot.png` |
| KrishiCred Marketplace | `KrishiCred Marketplace_screenshot.png` |
| KrishiCred Plant Dashboard | `KrishiCred Plant Dashboard_screenshot.png` |

#### 2. HTML Code (14 files)
| File | Description |
|------|-------------|
| `KrishiCred Home.html` | Main landing page |
| `KrishiCred Plant Dashboard.html` | Plant operator view |
| `KrishiCred Marketplace.html` | Carbon marketplace |
| `KrishiCred Government Monitor.html` | Government dashboard |
| `Farmer Flow Diagram.html` | Farmer user flow |
| `Government Flow Diagram.html` | Government flow |
| `Plant Flow Diagram.html` | Plant operator flow |
| `WhatsApp Farmer Flow.html` | WhatsApp integration flow |
| `Home Page (Farmer View).html` | Farmer home view |
| `Government Dashboard.html` | Government dashboard |
| `Plant Dashboard.html` | Plant dashboard |
| `Carbon Marketplace.html` | Carbon trading |
| `KrishiCred Design Brief (PRD).html` | Product requirements |
| `KrishiCred API Documentation Reference.html` | API docs |

---

## Design System: "Harvest Horizon"

### Color Palette

#### Primary Colors
- **Primary**: `#006c49` (Emerald Green)
- **Primary Container**: `#10b981` (Light Emerald)
- **On Primary**: `#ffffff` (White)
- **On Primary Container**: `#00422b` (Dark Green)

#### Secondary Colors (Gold/Amber for Finance)
- **Secondary**: `#855300` (Gold Brown)
- **Secondary Container**: `#fea619` (Amber)
- **On Secondary**: `#ffffff` (White)
- **On Secondary Container**: `#684000` (Dark Brown)

#### Tertiary Colors (Red for Alerts/Fire)
- **Tertiary**: `#b91a24` (Red)
- **Tertiary Container**: `#ff7a73` (Light Red)
- **On Tertiary**: `#ffffff` (White)
- **On Tertiary Container**: `#79000e` (Dark Red)

#### Neutral Colors
- **Background**: `#f8f9ff` (Very Light Blue)
- **Surface**: `#f8f9ff` (Same as background)
- **Surface Container**: `#e5eeff` (Light Blue Gray)
- **Surface Container Low**: `#eef4ff`
- **Surface Container Lowest**: `#ffffff` (Pure White for cards)
- **Surface Container High**: `#dfe9fa`
- **Surface Dim**: `#d1dbec`
- **On Background**: `#121c28` (Dark Slate)
- **On Surface**: `#121c28`
- **On Surface Variant**: `#3c4a42` (Muted Green)
- **Outline**: `#6c7a71`
- **Outline Variant**: `#bbcabf`

#### Error Colors
- **Error**: `#ba1a1a`
- **Error Container**: `#ffdad6`
- **On Error**: `#ffffff`
- **On Error Container**: `#93000a`

### Typography

#### Font Families
- **Headlines/Display**: Plus Jakarta Sans
- **Body**: Be Vietnam Pro
- **Labels**: Be Vietnam Pro

#### Font Scale
- **Display/Large**: Hero text, very large
- **Headline/M**: Primary navigation anchor
- **Body/M**: Long-form content
- **Labels**: Semi-bold for high-visibility metadata

### Design Principles

1. **No 1px Borders** - Use background shifts instead
2. **Tonal Layering** - Create depth through light, not shadows
3. **56px Minimum Button Height** - For outdoor/glove usage
4. **Bilingual Support** - English + Punjabi (Punjabi 10% larger)
5. **Rural-First** - High contrast for outdoor legibility

### Component Guidelines

#### Buttons
- **Primary**: `#006c49` background, white text
- **Financial/Credits**: `#fea619` (amber) background
- **Height**: Minimum 56px
- **Radius**: `rounded-xl` (1.5rem)

#### Cards
- Use `surface_container_lowest` (#ffffff) on `surface` (#f8f9ff)
- 24px vertical spacing between items
- No dividers - use whitespace instead

#### Chips/Badges
- **Alerts**: `#ff7a73` with `#79000e` text
- **Success**: `#10b981` with `#00422b` text

---

## Tech Stack from HTML

- **Framework**: Tailwind CSS
- **Icons**: Material Symbols Outlined
- **Fonts**: Google Fonts (Plus Jakarta Sans, Inter, Be Vietnam Pro)
- **Language**: HTML5 with inline JavaScript

---

## Next Steps

1. **Copy HTML code** to your React/Vue project
2. **Extract design tokens** to Tailwind config
3. **Implement responsive** breakpoints
4. **Add state management** for user flows
5. **Connect to backend API** at `http://localhost:8888`
