"""SPEEDX — Hyderabad Urban Heat Observatory API (FastAPI).

Run: uvicorn app.main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
import logging
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import services

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("speedx")

app = FastAPI(title="SPEEDX Heat Intel API", version="1.0.0",
              description="Hyderabad Urban Heat Observatory — demo mode. Demo values are synthetic, never presented as observations.")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(CORSMiddleware, allow_origins=[FRONTEND, "http://localhost:5174"],
                   allow_methods=["GET", "POST"], allow_headers=["*"])


class ProfileIn(BaseModel):
    age_range: str = "30-45"
    occupation: str = "Student"
    outdoor_hours: float = Field(default=4, ge=0, le=14)
    activity: str = "moderate"
    shade_access: bool = False
    zone_id: str = "charminar"
    conditions: list[str] = []  # optional, consent-based
    hydration: str = "regular"
    time_of_day: str = "midday"


@app.get("/health")
def health():
    return {"status": "ok", "service": "SPEEDX", "mode": "DEMO",
            "note": "Zone measurements are synthetic demo values. Weather endpoints proxy Open-Meteo when reachable."}


@app.get("/zones")
def zones():
    return [{"id": z[0], "name": z[1], "ward": z[2], "lat": z[3], "lng": z[4],
             "env": services.zone_env(z), "population": z[18], "vulnerability": z[19],
             "shelters": z[20], "water_points": z[21], "source": "DEMO"} for z in services.ZONES]


@app.get("/zones/{zone_id}")
def zone_detail(zone_id: str):
    z = next((x for x in services.ZONES if x[0] == zone_id), None)
    if not z:
        raise HTTPException(404, "Unknown zone_id")
    return {"id": z[0], "name": z[1], "ward": z[2], "lat": z[3], "lng": z[4], "env": services.zone_env(z), "source": "DEMO"}


@app.get("/weather/current")
@limiter.limit("30/minute")
async def weather_current(request: Request, zone_id: str = "charminar"):
    z = next((x for x in services.ZONES if x[0] == zone_id), services.ZONES[0])
    live = await services.fetch_open_meteo(z[3], z[4])
    if live and "current" in live:
        return {"source": "Open-Meteo (live)", "zone": z[1], **live["current"]}
    return {"source": "DEMO", "zone": z[1], **services.zone_env(z)}


@app.get("/weather/forecast")
@limiter.limit("30/minute")
async def weather_forecast(request: Request, zone_id: str = "charminar"):
    z = next((x for x in services.ZONES if x[0] == zone_id), services.ZONES[0])
    live = await services.fetch_open_meteo(z[3], z[4])
    if live and "daily" in live:
        return {"source": "Open-Meteo (live)", "zone": z[1], "daily": live["daily"]}
    return {"source": "DEMO", "zone": z[1], "forecast": services.demo_forecast(zone_id)}


@app.post("/risk/assess")
@limiter.limit("60/minute")
def risk_assess(request: Request, profile: ProfileIn):
    p = profile.model_dump()
    return {"profile_zone": profile.zone_id, **services.assess(p, profile.zone_id)}


@app.get("/risk")
def risk_get(zone_id: str = "charminar", age_range: str = "30-45", occupation: str = "Student",
             outdoor_hours: float = 4, activity: str = "moderate", shade_access: bool = False):
    p = {"age_range": age_range, "occupation": occupation, "outdoor_hours": outdoor_hours,
         "activity": activity, "shade_access": shade_access, "conditions": [], "hydration": "regular", "time_of_day": "midday"}
    return services.assess(p, zone_id)


@app.post("/profile")
def profile_save(request: Request, profile: ProfileIn):
    # Privacy-aware: demo mode does not persist sensitive data. Acknowledge + echo back non-sensitive fields.
    log.info("profile assessed zone=%s occ=%s (no health data persisted)", profile.zone_id, profile.occupation)
    return {"saved": False, "reason": "Demo mode: health context is never persisted server-side.",
            "assessment": services.assess(profile.model_dump(), profile.zone_id)}


@app.get("/hotspots")
def hotspots():
    return [{"zone": z[1], "ward": z[2], "risk_base": z[17], "lst_proxy": z[14], "source": "DEMO"} for z in services.ZONES]


@app.get("/thermal/layers")
def thermal_layers():
    return [{"zone": z[1], "lst": z[14], "ndvi": z[15], "builtup": z[16], "uhi": z[12], "source": "DEMO"} for z in services.ZONES]


@app.get("/advice")
def advice(zone_id: str = "charminar", **kw):
    p = {"age_range": kw.get("age_range", "30-45"), "occupation": kw.get("occupation", "Student"),
         "outdoor_hours": float(kw.get("outdoor_hours", 4)), "activity": kw.get("activity", "moderate"),
         "shade_access": kw.get("shade_access", False) == "true", "conditions": [], "hydration": "regular", "time_of_day": "midday"}
    risk = services.assess(p, zone_id)
    return {"risk": risk, "recommendations": services.recommendations(p, risk),
            "disclaimer": "Rule-based safety guidance, not medical advice. Emergency: 108."}


@app.get("/nearby")
def nearby(zone_id: str = "charminar"):
    # Demo facility hints only — production: Overpass / PostGIS with verified data.
    return {"zone": zone_id, "facilities": "See frontend Cool Shelters module (DEMO entries).",
            "warning": "Do not navigate to demo facilities without verifying with GHMC."}


@app.get("/city/interventions")
def city_interventions():
    return services.interventions()


@app.get("/employer/exposure")
def employer(zone_id: str = "charminar"):
    z = next((x for x in services.ZONES if x[0] == zone_id), services.ZONES[0])
    return {"zone": z[1], "schedule": [
        {"slot": "05:00–10:00", "risk": "LOW"}, {"slot": "10:00–13:00", "risk": "MODERATE"},
        {"slot": "13:00–16:00", "risk": "SEVERE"}, {"slot": "16:00–19:00", "risk": "HIGH"}],
        "rest_cycle": "20 min shaded rest per hour", "note": "Aggregated guidance only — no individual health data."}
