// Deterministic, explainable personal heat-risk engine.
// DEMO MODEL — not clinically validated. Transparent weighted formula, no randomness.

import type { Profile, RiskBreakdown, RiskTier, Recommendation, Zone } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const AGE_VULN: Record<string, number> = { '18-30': 10, '30-45': 18, '45-60': 32, '60+': 48, 'Under 18': 42 };
const OCC_VULN: Record<string, number> = { 'Delivery / Gig worker': 30, 'Construction': 28, 'Street vendor': 26, 'Agriculture / Outdoor labour': 28, 'Security / Traffic': 22, 'Student': 12, 'Office / Indoor': 6, 'Retired': 20 };
const ACTIVITY_EXP: Record<string, number> = { low: 8, moderate: 16, high: 26, very_high: 34 };
const TIME_FACTOR: Record<string, number> = { morning: 4, midday: 14, evening: 8 };
const COND_VULN: Record<string, number> = { 'Diabetes': 12, 'Hypertension': 10, 'Heart condition': 16, 'Asthma / Respiratory': 10, 'Kidney condition': 14, 'Pregnancy': 14, 'Taking heat-sensitive medication': 8 };

export function assessRisk(profile: Profile, zone: Zone): RiskBreakdown {
  const e = zone.env;
  // Hazard 0-50
  const hazard =
    clamp((e.heatIndex - 30) * 2.2, 0, 20) +
    clamp((e.coreTemp - 32) * 1.6, 0, 12) +
    clamp((e.wetBulb - 24) * 1.8, 0, 10) +
    clamp((e.uvIndex - 5) * 1.2, 0, 5) +
    clamp(e.uhiAnomaly * 0.6, 0, 3);
  const hazardScore = clamp(Math.round(hazard), 0, 50);

  // Exposure 0-30
  const exposure =
    clamp(profile.outdoorHours * 3.2, 0, 18) +
    (ACTIVITY_EXP[profile.activity] ?? 10) +
    (TIME_FACTOR[profile.timeOfDay] ?? 8) +
    (profile.shadeAccess ? -6 : 8);
  const exposureScore = clamp(Math.round(exposure), 0, 30);

  // Vulnerability 0-20
  let vuln =
    (AGE_VULN[profile.ageRange] ?? 15) * 0.22 +
    (OCC_VULN[profile.occupation] ?? 12) * 0.35 +
    profile.conditions.reduce((s, c) => s + (COND_VULN[c] ?? 5), 0) * 0.6 +
    (profile.hydration === 'low' ? 3 : profile.hydration === 'regular' ? 1 : 0);
  const vulnerabilityScore = clamp(Math.round(vuln), 0, 20);

  const total = clamp(hazardScore + exposureScore + vulnerabilityScore, 0, 100);
  const tier: RiskTier = total >= 70 ? 'SEVERE' : total >= 50 ? 'HIGH' : total >= 30 ? 'MODERATE' : 'LOW';

  const factors = [
    { label: 'Heat Index Saturation', contribution: clamp(Math.round((e.heatIndex - 30) * 2.2 * 0.5), 0, 12), note: `${e.heatIndex.toFixed(1)}°C — ${e.heatIndex >= 45 ? 'dangerous' : e.heatIndex >= 40 ? 'high' : 'elevated'}` },
    { label: 'Wet-Bulb Barrier', contribution: clamp(Math.round((e.wetBulb - 24) * 1.8 * 0.5), 0, 10), note: `${e.wetBulb.toFixed(1)}°C — sweat evaporation ${e.wetBulb >= 28 ? 'severely impaired' : 'reduced'}` },
    { label: 'UV / Solar Load', contribution: clamp(Math.round((e.uvIndex - 5) * 1.2 * 0.5), 0, 5), note: `UV ${e.uvIndex} (${e.uvIndex >= 11 ? 'Extreme' : e.uvIndex >= 8 ? 'Very High' : 'High'})` },
    { label: 'Outdoor Exposure', contribution: clamp(Math.round(profile.outdoorHours * 3.2 * 0.5), 0, 12), note: `${profile.outdoorHours}h outdoors` },
    { label: 'Activity Intensity', contribution: Math.round((ACTIVITY_EXP[profile.activity] ?? 10) * 0.5), note: profile.activity.replace('_', ' ') },
    { label: 'Shade Access', contribution: profile.shadeAccess ? -6 : 8, note: profile.shadeAccess ? 'Shade available — protective' : 'No shade — full solar exposure' },
    { label: 'Age Vulnerability', contribution: Math.round((AGE_VULN[profile.ageRange] ?? 15) * 0.22 * 0.5), note: `Age ${profile.ageRange}` },
    { label: 'Occupational Vulnerability', contribution: Math.round((OCC_VULN[profile.occupation] ?? 12) * 0.35 * 0.5), note: profile.occupation },
    { label: 'Health Conditions (optional)', contribution: Math.round(profile.conditions.reduce((s, c) => s + (COND_VULN[c] ?? 5), 0) * 0.6 * 0.5), note: profile.conditions.length ? profile.conditions.join(', ') : 'None disclosed' },
    { label: 'UHI Anomaly', contribution: Math.round(e.uhiAnomaly * 0.6 * 0.5), note: `+${e.uhiAnomaly}°C above surroundings` },
  ].sort((a, b) => b.contribution - a.contribution);

  return { total, tier, hazard: hazardScore, exposure: exposureScore, vulnerability: vulnerabilityScore, factors };
}

// Rule-based safety recommendations (medical/safety-critical decisions are rule-based, never LLM).
export function buildRecommendations(profile: Profile, zone: Zone, risk: RiskBreakdown): Recommendation[] {
  const recs: Recommendation[] = [];
  const sev = risk.tier === 'SEVERE' || risk.tier === 'HIGH';
  if (risk.total >= 70) recs.push({ id: 'r1', title: 'Reschedule outdoor work to 05:00–10:00 & after 17:00', detail: 'Peak thermal load (11:00–16:00) at this zone is life-threatening. Split shifts around the midday window.', priority: 'critical', audience: 'Outdoor workers & employers' });
  if (risk.exposure > 15) recs.push({ id: 'r2', title: 'Enforce 20-min shaded rest every hour', detail: 'With >6h exposure, mandatory shaded rest cycles reduce heat-strain accumulation.', priority: 'critical', audience: 'Outdoor workers & employers' });
  recs.push({ id: 'r3', title: 'Hydrate 500ml/hour; ORS in extreme heat', detail: 'Sweat loss above 1L/hr is expected at current wet-bulb. Plain water alone may be insufficient; use oral rehydration salts.', priority: 'high', audience: 'Everyone outdoors' });
  if (!profile.shadeAccess) recs.push({ id: 'r4', title: 'Prioritise shade + cooling shelter access', detail: 'No shade access detected. Nearest cooling points are listed in the Cool Shelters module.', priority: 'high', audience: 'Citizens & municipal bodies' });
  if (profile.conditions.length) recs.push({ id: 'r5', title: 'Heat warning signs — seek care immediately', detail: 'Confusion, vomiting, hot dry skin, or collapse = heat stroke emergency. Call 108 / go to nearest hospital. This is general guidance, not medical advice.', priority: 'critical', audience: 'People with disclosed conditions' });
  if (sev) recs.push({ id: 'r6', title: 'Municipal: deploy water points & shade structures', detail: `${zone.ward} ranks high on vulnerability (${zone.vulnerability}/100). Priority intervention recommended.`, priority: 'high', audience: 'GHMC / Municipal authority' });
  recs.push({ id: 'r7', title: 'Safer window today: before 10:30 AM', detail: 'Forecast heat-risk dips in early morning. Plan deliveries, construction and exercise accordingly.', priority: 'medium', audience: 'Everyone' });
  return recs;
}

export const DISCLAIMER = 'SPEEDX risk scores are a transparent demonstration model for awareness and planning. They are not clinically validated medical predictions. In a heat emergency call 108 or visit the nearest hospital.';
