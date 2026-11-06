import type { CloudState } from './types';
export type { CloudState };

export const CLOUD_STATES: CloudState[] = [
  { id: 'clear', name: 'Clear Bloom', cover: 8, attenuation: 5, windDrift: 6, turbulence: 22, tempDelta: 0, desc: 'Fully exposed solar heating. Maximum thermal load.' },
  { id: 'cirrus', name: 'High Cirrus', cover: 34, attenuation: 18, windDrift: 14, turbulence: 38, tempDelta: -1.2, desc: 'Thin high clouds scatter radiation; slight cooling.' },
  { id: 'haze', name: 'Thermal Haze', cover: 58, attenuation: 34, windDrift: 9, turbulence: 61, tempDelta: -2.4, desc: 'Haze traps heat near surface; feels hotter despite less sun.' },
  { id: 'monsoon', name: 'Monsoon Storm', cover: 92, attenuation: 78, windDrift: 28, turbulence: 88, tempDelta: -6.5, desc: 'Heavy storm breaks the heatwave; humidity rises sharply.' },
];

// Derive a simulation state from LIVE Open-Meteo readings so clouds follow real weather.
export function cloudStateFromLive(cover: number, code: number, windKmh: number): CloudState {
  const base = code >= 51 || code >= 80 || cover >= 70
    ? CLOUD_STATES[3]
    : cover >= 45
      ? CLOUD_STATES[2]
      : cover >= 20
        ? CLOUD_STATES[1]
        : CLOUD_STATES[0];
  return { ...base, cover: Math.round(cover), windDrift: Math.round(windKmh) };
}
