"""Service layer mirroring the frontend deterministic risk engine.

DEMO MODE: zone measurements are synthetic. /weather/* proxies Open-Meteo when reachable,
otherwise returns clearly-labelled demo data. Never present demo values as observations.
"""
from __future__ import annotations
import math
import httpx

HYDERABAD = (17.385, 78.4867)  # lat, lng

# id, name, ward, lat, lng, core_temp, feels_like, heat_index, humidity, wet_bulb, uv, solar, uhi, wind, lst, ndvi, builtup, risk_base, population, vulnerability, shelters, water_points
ZONES = [
    ("charminar", "Charminar Core", "Ward 72 Charminar (Old City)", 17.3596, 78.4738, 41.2, 46.8, 48.5, 38, 29.4, 11, 892, 5.6, 9, 52.3, 0.12, 0.92, 88, 142000, 86, 3, 14),
    ("secunderabad", "Secunderabad Junction", "Secunderabad Cantonment", 17.4446, 78.4936, 40.1, 45.2, 46.9, 40, 28.6, 10, 845, 4.8, 11, 50.1, 0.18, 0.85, 79, 98000, 72, 5, 19),
    ("madhapur", "Madhapur Tech Corridor", "Ward 104 Madhapur", 17.4484, 78.3919, 39.4, 44.1, 45.6, 42, 28.1, 10, 831, 4.2, 13, 48.7, 0.21, 0.80, 74, 76000, 58, 4, 16),
    ("kbr", "KBR Green Refuge", "Banjara Hills / KBR Park", 17.4222, 78.4257, 36.8, 40.9, 42.3, 47, 26.9, 7, 642, 1.9, 12, 43.2, 0.62, 0.30, 41, 22000, 34, 7, 11),
]

AGE_VULN = {"18-30": 10, "30-45": 18, "45-60": 32, "60+": 48, "Under 18": 42}
OCC_VULN = {"Delivery / Gig worker": 30, "Construction": 28, "Street vendor": 26, "Agriculture / Outdoor labour": 28, "Security / Traffic": 22, "Student": 12, "Office / Indoor": 6, "Retired": 20}
ACTIVITY = {"low": 8, "moderate": 16, "high": 26, "very_high": 34}
TIME_F = {"morning": 4, "midday": 14, "evening": 8}
COND_VULN = {"Diabetes": 12, "Hypertension": 10, "Heart condition": 16, "Asthma / Respiratory": 10, "Kidney condition": 14, "Pregnancy": 14, "Taking heat-sensitive medication": 8}

def clamp(v, lo, hi): return min(hi, max(lo, v))

def zone_env(z):
    return dict(core_temp=z[5], feels_like=z[6], heat_index=z[7], humidity=z[8], wet_bulb=z[9], uv_index=z[10],
                solar_wm2=z[11], uhi_anomaly=z[12], wind_kmh=z[13], lst=z[14], ndvi=z[15], builtup=z[16], risk_base=z[17])

def assess(profile: dict, zone_id: str) -> dict:
    z = next((x for x in ZONES if x[0] == zone_id), ZONES[0])
    e = zone_env(z)
    hazard = clamp((e["heat_index"] - 30) * 2.2, 0, 20) + clamp((e["core_temp"] - 32) * 1.6, 0, 12) \
        + clamp((e["wet_bulb"] - 24) * 1.8, 0, 10) + clamp((e["uv_index"] - 5) * 1.2, 0, 5) + clamp(e["uhi_anomaly"] * 0.6, 0, 3)
    hazard = round(clamp(hazard, 0, 50))
    exposure = clamp(profile.get("outdoor_hours", 4) * 3.2, 0, 18) + ACTIVITY.get(profile.get("activity", "moderate"), 10) \
        + TIME_F.get(profile.get("time_of_day", "midday"), 8) + (-6 if profile.get("shade_access") else 8)
    exposure = round(clamp(exposure, 0, 30))
    vuln = (AGE_VULN.get(profile.get("age_range", "30-45"), 15) * 0.22 + OCC_VULN.get(profile.get("occupation", "Student"), 12) * 0.35
            + sum(COND_VULN.get(c, 5) for c in profile.get("conditions", [])) * 0.6
            + (3 if profile.get("hydration") == "low" else 1 if profile.get("hydration") == "regular" else 0))
    vuln = round(clamp(vuln, 0, 20))
    total = round(clamp(hazard + exposure + vuln, 0, 100))
    tier = "SEVERE" if total >= 70 else "HIGH" if total >= 50 else "MODERATE" if total >= 30 else "LOW"
    return {"total": total, "tier": tier, "hazard": hazard, "exposure": exposure, "vulnerability": vuln,
            "factors": [
                {"label": "Heat Index Saturation", "contribution": round(clamp((e["heat_index"] - 30) * 2.2 * 0.5, 0, 12))},
                {"label": "Wet-Bulb Barrier", "contribution": round(clamp((e["wet_bulb"] - 24) * 1.8 * 0.5, 0, 10))},
                {"label": "Outdoor Exposure", "contribution": round(clamp(profile.get("outdoor_hours", 4) * 3.2 * 0.5, 0, 12))},
                {"label": "Shade Access", "contribution": -6 if profile.get("shade_access") else 8},
            ], "disclaimer": "Demo model — not clinically validated. In emergency call 108."}

def recommendations(profile: dict, risk: dict) -> list:
    recs = []
    if risk["total"] >= 70:
        recs.append({"title": "Reschedule outdoor work to 05:00–10:00 & after 17:00", "priority": "critical"})
    if risk["exposure"] > 15:
        recs.append({"title": "Enforce 20-min shaded rest every hour", "priority": "critical"})
    recs.append({"title": "Hydrate 500ml/hour; ORS in extreme heat", "priority": "high"})
    if not profile.get("shade_access"):
        recs.append({"title": "Prioritise shade + cooling shelter access", "priority": "high"})
    recs.append({"title": "Safer window today: before 10:30 AM", "priority": "medium"})
    return recs

async def fetch_open_meteo(lat: float, lng: float) -> dict | None:
    """Live forecast from Open-Meteo (no key required). Returns None on failure."""
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.get("https://api.open-meteo.com/v1/forecast", params={
                "latitude": lat, "longitude": lng, "current": "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
                "hourly": "temperature_2m,relative_humidity_2m", "daily": "temperature_2m_max,temperature_2m_min",
                "timezone": "Asia/Kolkata", "forecast_days": 7})
            r.raise_for_status()
            return r.json()
    except Exception:
        return None

def demo_forecast(zone_id: str) -> list:
    z = next((x for x in ZONES if x[0] == zone_id), ZONES[0])
    offsets = [0, 1.3, 2.8, 2.2, 0.6, -0.8, -1.6]
    out = []
    for i, o in enumerate(offsets):
        m = round(z[5] + o, 1)
        out.append({"day_offset": i, "max_temp": m, "min_temp": round(m - 9.5, 1),
                    "heat_risk": "EXTREME" if m >= 44 else "SEVERE" if m >= 41 else "HIGH" if m >= 38 else "MODERATE",
                    "source": "DEMO"})
    return out

def interventions() -> list:
    rows = []
    for z in ZONES:
        pri = round(z[17] * 0.5 + z[19] * 0.3 + (z[18] / 100000) * 10 - z[20] * 4)
        rows.append({"zone_id": z[0], "name": z[1], "ward": z[2], "priority": pri,
                     "tree_plantation": "HIGH" if z[15] < 0.2 else "MEDIUM",
                     "water_points": z[21], "shelters": z[20], "source": "DEMO aggregate"})
    return sorted(rows, key=lambda r: -r["priority"])
