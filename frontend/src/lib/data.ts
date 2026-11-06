// DEMO MODE — all values below are synthetic demonstrations, NOT real-time observations.
// Zones are real Hyderabad locations; measurements are simulated for hackathon demo.

import type { Zone, ForecastDay, Facility } from './types';

export const ZONES: Zone[] = [
  {
    id: 'charminar',
    name: 'Charminar Core',
    ward: 'Ward 72 Charminar (Old City)',
    lat: 17.3596, lng: 78.4738,
    area: 'Old City — dense built-up, low vegetation',
    env: { coreTemp: 41.2, feelsLike: 46.8, heatIndex: 48.5, humidity: 38, wetBulb: 29.4, uvIndex: 11, solarWm2: 892, uhiAnomaly: 5.6, windKmh: 9, lst: 52.3, ndvi: 0.12, builtup: 0.92, riskBase: 88, hotspotLabel: 'SEVERE hotspot' },
    population: 142000, vulnerability: 86, shelters: 3, waterPoints: 14,
  },
  {
    id: 'secunderabad',
    name: 'Secunderabad Junction',
    ward: 'Secunderabad Cantonment',
    lat: 17.4446, lng: 78.4936,
    area: 'Rail hub — high footfall, concrete expanse',
    env: { coreTemp: 40.1, feelsLike: 45.2, heatIndex: 46.9, humidity: 40, wetBulb: 28.6, uvIndex: 10, solarWm2: 845, uhiAnomaly: 4.8, windKmh: 11, lst: 50.1, ndvi: 0.18, builtup: 0.85, riskBase: 79, hotspotLabel: 'HIGH hotspot' },
    population: 98000, vulnerability: 72, shelters: 5, waterPoints: 19,
  },
  {
    id: 'madhapur',
    name: 'Madhapur Tech Corridor',
    ward: 'Ward 104 Madhapur',
    lat: 17.4484, lng: 78.3919,
    area: 'IT corridor — glass towers, sparse shade',
    env: { coreTemp: 39.4, feelsLike: 44.1, heatIndex: 45.6, humidity: 42, wetBulb: 28.1, uvIndex: 10, solarWm2: 831, uhiAnomaly: 4.2, windKmh: 13, lst: 48.7, ndvi: 0.21, builtup: 0.8, riskBase: 74, hotspotLabel: 'HIGH hotspot' },
    population: 76000, vulnerability: 58, shelters: 4, waterPoints: 16,
  },
  {
    id: 'kbr',
    name: 'KBR Green Refuge',
    ward: 'Banjara Hills / KBR Park',
    lat: 17.4222, lng: 78.4257,
    area: 'Parkland — tree canopy cooling refuge',
    env: { coreTemp: 36.8, feelsLike: 40.9, heatIndex: 42.3, humidity: 47, wetBulb: 26.9, uvIndex: 7, solarWm2: 642, uhiAnomaly: 1.9, windKmh: 12, lst: 43.2, ndvi: 0.62, builtup: 0.3, riskBase: 41, hotspotLabel: 'LOW hotspot — cool island' },
    population: 22000, vulnerability: 34, shelters: 7, waterPoints: 11,
  },
];

export const FACILITIES: Facility[] = [
  { id: 'f1', name: 'Charminar Cool Shelter — Community Hall', type: 'shelter', zoneId: 'charminar', distanceKm: 0.4, status: 'OPEN', capacity: 'Demo capacity data', note: 'DEMO location — verify with GHMC before use.' },
  { id: 'f2', name: 'Osmania General Hospital — Cooling Wing', type: 'hospital', zoneId: 'charminar', distanceKm: 1.8, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f3', name: 'Laad Bazaar Water Point', type: 'water', zoneId: 'charminar', distanceKm: 0.6, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f4', name: 'Mir Alam Tank Park — Shade Refuge', type: 'park', zoneId: 'charminar', distanceKm: 2.3, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f5', name: 'Secunderabad Railway Shelter', type: 'shelter', zoneId: 'secunderabad', distanceKm: 0.3, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f6', name: 'Malkajgiri Community Shelter', type: 'shelter', zoneId: 'secunderabad', distanceKm: 3.1, status: 'LIMITED', note: 'DEMO entry.' },
  { id: 'f7', name: 'Cyberabad Water Point — Madhapur', type: 'water', zoneId: 'madhapur', distanceKm: 0.8, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f8', name: 'Madhapur Lake Park', type: 'park', zoneId: 'madhapur', distanceKm: 1.2, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f9', name: 'KBR National Park — Tree Canopy Refuge', type: 'park', zoneId: 'kbr', distanceKm: 0.5, status: 'OPEN', note: 'DEMO entry.' },
  { id: 'f10', name: 'Jubilee Hills Cool Shelter', type: 'shelter', zoneId: 'kbr', distanceKm: 1.6, status: 'OPEN', note: 'DEMO entry.' },
];

export function demoForecast(zone: Zone): ForecastDay[] {
  const base = zone.env.coreTemp;
  const offsets = [0, 1.3, 2.8, 2.2, 0.6, -0.8, -1.6];
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  return offsets.map((o, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const max = +(base + o).toFixed(1);
    const heatRisk = max >= 44 ? 'EXTREME' : max >= 41 ? 'SEVERE' : max >= 38 ? 'HIGH' : 'MODERATE';
    const alert = max >= 44 ? 'RED ALERT' : max >= 41 ? 'HEAT ADVISORY' : 'STANDARD';
    return {
      date: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
      dayName: names[(d.getDay() + 6) % 7],
      maxTemp: max,
      minTemp: +(max - 9.5).toFixed(1),
      heatRisk,
      weatherIcon: max >= 42 ? 'sun' : 'cloud-sun',
      alert,
    };
  });
}
// Hyderabad neighborhoods available for search (DEMO coordinates; measurements come from live weather when online).
export interface AreaHit { id: string; name: string; ward: string; lat: number; lng: number; area: string; }
export const HYDERABAD_AREAS: AreaHit[] = [
  { id: 'banjara-hills', name: 'Banjara Hills', ward: 'Banjara Hills', lat: 17.4126, lng: 78.4482, area: 'Upscale residential — tree canopy, moderate heat' },
  { id: 'jubilee-hills', name: 'Jubilee Hills', ward: 'Jubilee Hills', lat: 17.4326, lng: 78.4071, area: 'Hilly residential — cooler microclimate' },
  { id: 'hitec-city', name: 'HITEC City', ward: 'Madhapur / HITEC City', lat: 17.4435, lng: 78.3772, area: 'IT hub — glass towers' },
  { id: 'gachibowli', name: 'Gachibowli', ward: 'Gachibowli', lat: 17.4401, lng: 78.3489, area: 'IT corridor — expanding built-up' },
  { id: 'kondapur', name: 'Kondapur', ward: 'Kondapur', lat: 17.4603, lng: 78.3630, area: 'Residential — mixed use' },
  { id: 'miyapur', name: 'Miyapur', ward: 'Miyapur', lat: 17.4960, lng: 78.3540, area: 'Suburban — growing density' },
  { id: 'kukatpally', name: 'Kukatpally', ward: 'Kukatpally', lat: 17.4849, lng: 78.4138, area: 'Dense residential' },
  { id: 'ameerpet', name: 'Ameerpet', ward: 'Ameerpet', lat: 17.4374, lng: 78.4483, area: 'Commercial hub — high footfall' },
  { id: 'begumpet', name: 'Begumpet', ward: 'Begumpet', lat: 17.4440, lng: 78.4680, area: 'Mixed residential/commercial' },
  { id: 'abids', name: 'Abids', ward: 'Abids', lat: 17.3930, lng: 78.4750, area: 'Central business district' },
  { id: 'lb-nagar', name: 'LB Nagar', ward: 'LB Nagar', lat: 17.3457, lng: 78.5522, area: 'Eastern residential' },
  { id: 'uppal', name: 'Uppal', ward: 'Uppal', lat: 17.3990, lng: 78.5590, area: 'Eastern corridor' },
  { id: 'dilsukhnagar', name: 'Dilsukhnagar', ward: 'Dilsukhnagar', lat: 17.3680, lng: 78.5240, area: 'Dense commercial/residential' },
  { id: 'tolichowki', name: 'Tolichowki', ward: 'Tolichowki', lat: 17.3930, lng: 78.4220, area: 'Mixed residential' },
  { id: 'mehdipatnam', name: 'Mehdipatnam', ward: 'Mehdipatnam', lat: 17.3960, lng: 78.4390, area: 'Commercial — busy junction' },
  { id: 'old-city', name: 'Old City (Charminar)', ward: 'Ward 72 Charminar', lat: 17.3616, lng: 78.4747, area: 'Historic dense core' },
  { id: 'secunderabad', name: 'Secunderabad', ward: 'Secunderabad Cantonment', lat: 17.4399, lng: 78.4983, area: 'Rail hub' },
  { id: 'trimulgherry', name: 'Trimulgherry', ward: 'Trimulgherry', lat: 17.4660, lng: 78.5050, area: 'Cantonment' },
  { id: 'alwal', name: 'Alwal', ward: 'Alwal', lat: 17.4960, lng: 78.5120, area: 'Northern suburb' },
  { id: 'medchal', name: 'Medchal', ward: 'Medchal', lat: 17.6260, lng: 78.4810, area: 'Peri-urban' },
  { id: 'shamshabad', name: 'Shamshabad', ward: 'Shamshabad', lat: 17.2543, lng: 78.4242, area: 'Airport zone' },
  { id: 'lingampally', name: 'Lingampally', ward: 'Lingampally', lat: 17.4840, lng: 78.3180, area: 'Western suburb' },
  { id: 'manikonda', name: 'Manikonda', ward: 'Manikonda', lat: 17.4010, lng: 78.3880, area: 'Residential — IT proximity' },
  { id: 'nallagandla', name: 'Nallagandla', ward: 'Nallagandla', lat: 17.4710, lng: 78.3100, area: 'New residential' },
  { id: 'tellapur', name: 'Tellapur', ward: 'Tellapur', lat: 17.4880, lng: 78.2780, area: 'Peri-urban' },
  { id: 'kokapet', name: 'Kokapet', ward: 'Kokapet', lat: 17.3890, lng: 78.3280, area: 'High-rise zone' },
  { id: 'financial-district', name: 'Financial District', ward: 'Nanakramguda', lat: 17.4160, lng: 78.3380, area: 'Corporate — glass towers' },
  { id: 'raidurg', name: 'Raidurg', ward: 'Raidurg', lat: 17.4300, lng: 78.3800, area: 'IT/business' },
  { id: 'kbr-park', name: 'KBR Park', ward: 'Banjara Hills / KBR Park', lat: 17.4222, lng: 78.4257, area: 'Parkland — cool island' },
];

