# OpenEnergyData (OEDA) Frontend

This is the official Next.js Frontend codebase for the OpenEnergyData platform, built strictly according to the v2.1.3 Master Specification.

## Tech Stack
- **Next.js 16 (App Router)** - Standard routing and optimized builds.
- **TailwindCSS 4** - Used for strictly scoped CSS tokens, deep-space charcoal styling, and glassmorphism.
- **Apache ECharts** - Main canvas-based chart renderer executing < 100ms render speeds. 
- **Deck.gl** - WebGL based map rendering engine (handling Europe nodal matrices and Heatmaps).
- **Zustand** - Global frontend state manager (Timezones, Tab Resolutions, etc).
- **React Query** - Used with stale-while-revalidate for smart data polling at defined intervals.
- **Clerk** - Authentication middleware.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Application. 

*Note: Environment variables for Clerk Auth (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) will be required to activate production protection.*

## Design Decisions
- **Timezone Global Hook**: Timestamps operate via `dayjs` catching UTC and auto-translating charts and tooltips to the globally active Zustand zone (e.g., `Europe/Berlin`).
- **Dashboard Partial Failure System**: In case of restricted API access or JSON matrix degradation, the `WidgetErrorCard` component gracefully catches block failures without disrupting the dashboard.
- **Client Side Geo-Caching**: Nodal Maps load 96 point vectors in memory, exposing an instantaneous 0 to 95 interval UI slider leveraging hardware acceleration.
