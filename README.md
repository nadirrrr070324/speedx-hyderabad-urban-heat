# SPEEDX — Hyderabad Urban Heat Observatory

**Next Generation Climate Intelligence** — AI-powered urban heat intelligence & human exposure platform for Hyderabad.

Answers: Where is heat highest? Who is most vulnerable? What should citizens & authorities do?

> ⚠️ **Demo mode:** Zone measurements, forecasts and facilities are synthetic and clearly labelled `DEMO`. They are **not** real-time observations. Heat-risk scores come from a transparent deterministic model — **not clinically validated**. In a heat emergency call **108**.

## Quick start

### Prerequisites
- Node.js 18+ (`node --version`)
- Python 3.11+ (`python --version`) — for the backend

### Frontend
```powershell
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

### Backend
```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # docs: http://localhost:8000/docs
```

### Full stack (Docker)
```powershell
docker compose up --build
```
PostGIS + Redis included for production deployment.

## Demo flow (hackathon script)
1. Open Overview → select **Ward 72 Charminar**.
2. Read hero metrics + Cloud Matrix (try *Monsoon Storm* — watch core temp drop).
3. Open **Vulnerability Model** → enter *Delivery / Gig worker, 8h outdoors, no shade* → risk score + factor breakdown.
4. Explore the **Thermal Radar** (drag to pan, scroll to zoom, toggle layers).
5. Open **Thermal GIS** → ward ranking; switch layers.
6. Open **Cool Shelters**, then switch to **Municipality** (profile menu) and **Employer** dashboards.

## Architecture
- `frontend/` — React + TypeScript + Vite, Tailwind, Framer Motion, Recharts. Design system matches the SPEEDX reference (`screen.png`).
- `backend/` — FastAPI. Modules: `services.py` (risk engine, zones, Open-Meteo proxy), `main.py` (all required routes), `models.py` (PostGIS schema sketch).
- Risk engine is **identical** in frontend (`src/lib/risk.ts`) and backend (`services.py`) — deterministic, explainable, no randomness.

## API
| Route | Purpose |
|---|---|
| `GET /health` | Health + mode |
| `GET /weather/current`, `/weather/forecast` | Open-Meteo live proxy, DEMO fallback |
| `POST /risk/assess`, `GET /risk` | Personal risk score |
| `POST /profile` | Privacy-aware profile assessment (no health persistence) |
| `GET /zones`, `/zones/{id}`, `/hotspots`, `/thermal/layers` | Zone & GIS data |
| `GET /advice`, `/nearby`, `/city/interventions`, `/employer/exposure` | Recommendations, facilities, municipal & employer views |

## Production roadmap
- Replace DEMO zones with PostGIS wards + Landsat/Sentinel LST rasters (Earth Engine).
- Train Random Forest/XGBoost on labelled ward data + SHAP explainability; keep the deterministic model as fallback.
- Verify facilities via OpenStreetMap Overpass; never fabricate capacity.
- Auth for municipal/employer dashboards; per-user data retention policies for optional health context.

## Security & privacy
Pydantic validation, rate limiting (slowapi), CORS allowlist, no secrets in git (`.env.example` only), health context is consent-based and never persisted server-side in demo mode.
