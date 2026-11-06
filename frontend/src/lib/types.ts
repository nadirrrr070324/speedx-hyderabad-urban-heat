export interface ZoneEnv {
  coreTemp: number; // °C ambient core
  feelsLike: number;
  heatIndex: number;
  humidity: number; // %
  wetBulb: number;
  uvIndex: number;
  solarWm2: number;
  uhiAnomaly: number; // °C
  windKmh: number;
  windDir?: number; // deg, when live
  pressure?: number; // hPa, when live
  cloudCover?: number; // %, when live
  lst: number; // land surface temp proxy
  ndvi: number;
  builtup: number; // 0-1
  riskBase: number; // 0-100 environmental risk
  hotspotLabel: string;
  source?: 'Open-Meteo (live)' | 'DEMO';
}

export interface Zone {
  id: string;
  name: string;
  ward: string;
  lat: number;
  lng: number;
  area: string;
  env: ZoneEnv;
  population: number; // aggregate exposure estimate (demo)
  vulnerability: number; // 0-100
  shelters: number;
  waterPoints: number;
  custom?: boolean; // true for user-defined geolocation zones (live-only, no demo proxies)
}

export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type RiskCategory = RiskTier | 'EXTREME';

export interface Profile {
  ageRange: string;
  occupation: string;
  outdoorHours: number;
  activity: 'low' | 'moderate' | 'high' | 'very_high';
  shadeAccess: boolean;
  zoneId: string;
  conditions: string[]; // optional, consent-based
  hydration: 'low' | 'regular' | 'high';
  timeOfDay: 'morning' | 'midday' | 'evening';
}

export interface RiskBreakdown {
  total: number;
  tier: RiskTier;
  hazard: number;
  exposure: number;
  vulnerability: number;
  factors: { label: string; contribution: number; note: string }[];
}

export interface ForecastDay {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  heatRisk: RiskCategory;
  weatherIcon: string;
  alert: string;
  precip?: number;
  code?: number;
  source?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'park' | 'water';
  zoneId: string;
  distanceKm: number;
  status: 'OPEN' | 'LIMITED' | 'UNKNOWN';
  capacity?: string;
  note: string;
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  priority: 'critical' | 'high' | 'medium';
  audience: string;
}

export interface AgeGuidance {
  ageRange: string;
  label: string;
  why: string; // why this age group is more/less vulnerable
  hydration: string; // litres / guidance
  outdoorLimit: string; // suggested max midday exposure
  precautions: string[];
  neverDo: string;
  warningSigns: string[];
  emergency: string;
}

export type GeoPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

export type Language = 'en' | 'hi' | 'te';

export interface CloudState {
  id: string;
  name: string;
  cover: number; // %
  attenuation: number; // solar reduction %
  windDrift: number; // km/h
  turbulence: number; // 0-100
  tempDelta: number; // simulated °C effect on core temp
  desc: string;
}
