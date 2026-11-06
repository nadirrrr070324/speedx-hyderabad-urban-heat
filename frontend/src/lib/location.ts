// Browser geolocation — permission-aware, opt-in only.
// Location is never sent to a server except to Open-Meteo (HTTPS, keyless) for weather at those coordinates.
// We never persist coordinates beyond the session without explicit user action.

import type { GeoPermission } from './types';
import { ZONES } from './data';

export interface GeoFix {
  lat: number;
  lng: number;
  accuracy: number; // metres
  at: Date;
}

export async function detectPermission(): Promise<GeoPermission> {
  if (!('geolocation' in navigator)) return 'unsupported';
  try {
    // permissions API is not available in all browsers (e.g. Safari) — fall back to prompt.
    const p = await (navigator.permissions?.query({ name: 'geolocation' as PermissionName }) ?? Promise.resolve(null));
    if (!p) return 'prompt';
    if (p.state === 'granted') return 'granted';
    if (p.state === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'prompt';
  }
}

export function getCurrentFix(timeoutMs = 10000): Promise<GeoFix> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new Error('unsupported')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, at: new Date() }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 },
    );
  });
}

export function watchFix(onFix: (f: GeoFix) => void, onError: (e: unknown) => void): () => void {
  if (!('geolocation' in navigator)) return () => {};
  const id = navigator.geolocation.watchPosition(
    pos => onFix({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, at: new Date() }),
    onError,
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLa = ((bLat - aLat) * Math.PI) / 180;
  const dLo = ((bLng - aLng) * Math.PI) / 180;
  const s = Math.sin(dLa / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestZone(lat: number, lng: number): { zone: (typeof ZONES)[number]; distKm: number } {
  let best = ZONES[0]; let bestD = Infinity;
  for (const z of ZONES) {
    const d = haversineKm(lat, lng, z.lat, z.lng);
    if (d < bestD) { bestD = d; best = z; }
  }
  return { zone: best, distKm: bestD };
}

// Reverse-geocode via BigDataCloud free API (no key). Returns a human label or null.
export async function reverseLabel(lat: number, lng: number): Promise<string | null> {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const j = await r.json();
    return j.city || j.locality || j.principalSubdivision || null;
  } catch {
    return null;
  }
}
