"""PostgreSQL + PostGIS schema sketch (SQLAlchemy) for production deployment.

Enable when DATABASE_URL is configured. Spatial indexing on zone/facility geometry.
Health context columns are intentionally absent from shared tables — consent-based
fields live in a restricted table with short retention (see README).
"""
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Integer


class Base(DeclarativeBase):
    pass


class MonitoringZone(Base):
    __tablename__ = "monitoring_zones"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    ward: Mapped[str] = mapped_column(String)
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    geom: Mapped[str] = mapped_column(String, nullable=True)  # PostGIS geometry (WKT) in production


class GridCell(Base):
    __tablename__ = "grid_cells"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    zone_id: Mapped[str] = mapped_column(String, index=True)
    lst: Mapped[float] = mapped_column(Float)
    ndvi: Mapped[float] = mapped_column(Float)
    builtup: Mapped[float] = mapped_column(Float)
    hotspot_score: Mapped[float] = mapped_column(Float)


class WeatherHourly(Base):
    __tablename__ = "weather_hourly"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    zone_id: Mapped[str] = mapped_column(String, index=True)
    hour: Mapped[str] = mapped_column(String)
    temp_c: Mapped[float] = mapped_column(Float)
    humidity: Mapped[int] = mapped_column(Integer)


class Facility(Base):
    __tablename__ = "facilities"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String, index=True)
    zone_id: Mapped[str] = mapped_column(String, index=True)
    status: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)  # e.g. 'OSM verified' — never fabricate


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    zone_id: Mapped[str] = mapped_column(String, index=True)
    total: Mapped[int] = mapped_column(Integer)
    tier: Mapped[str] = mapped_column(String)
    # No PII / health fields stored server-side in demo mode.
