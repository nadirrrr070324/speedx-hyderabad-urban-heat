// Open-Meteo live weather (no API key required) with demo-data fallback.
// Source label is always surfaced so live vs demo is never ambiguous.

export interface LiveWeather {
  source: 'Open-Meteo (live)' | 'DEMO';
  temp: number; // °C
  apparent: number; // feels like
  humidity: number; // %
  windKmh: number;
  windDir: number; // deg
  pressure: number; // hPa
  cloudCover: number; // %
  precipMm: number; // mm last hour
  uv: number | null;
  code: number;
  time: string;
}

const BASE = 'https://api.open-meteo.com/v1/forecast';

export function wetBulbApprox(temp: number, rh: number): number {
  // Stull (2011) approximation — good enough for demo display.
  return temp * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) + Math.atan(temp + rh) - Math.atan(rh - 1.676331) + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
}

export function heatIndexF(tempC: number, rh: number): number {
  const T = tempC * 9 / 5 + 32;
  const HI = -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh - 0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
  return (HI - 32) * 5 / 9;
}

export async function fetchLiveWeather(lat: number, lng: number): Promise<LiveWeather | null> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 9000);
  try {
    const url = `${BASE}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=uv_index&timezone=Asia%2FKolkata&forecast_days=1`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const j = await res.json();
    const c = j.current ?? {};
    const hrs: string[] = j.hourly?.time ?? [];
    const uvs: (number | null)[] = j.hourly?.uv_index ?? [];
    let uv: number | null = null;
    const nowDate = String(c.time ?? '').slice(0, 13);
    const idx = hrs.findIndex(h => String(h).slice(0, 13) === nowDate);
    if (idx >= 0) uv = uvs[idx] ?? null;
    return {
      source: 'Open-Meteo (live)',
      temp: c.temperature_2m, apparent: c.apparent_temperature, humidity: c.relative_humidity_2m,
      windKmh: c.wind_speed_10m, windDir: c.wind_direction_10m, pressure: c.pressure_msl,
      cloudCover: c.cloud_cover, precipMm: c.precipitation ?? 0, uv, code: c.weather_code ?? 0,
      time: c.time ?? '',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(to);
  }
}

export interface LiveForecastDay {
  date: string; dayName: string; maxTemp: number; minTemp: number;
  heatRisk: string; alert: string; precip: number; code: number; source: string;
}

export async function fetchLiveForecast(lat: number, lng: number): Promise<LiveForecastDay[] | null> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 9000);
  try {
    const url = `${BASE}?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia%2FKolkata&forecast_days=7`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const j = await res.json();
    const d = j.daily ?? {};
    const times: string[] = d.time ?? [];
    return times.map((t: string, i: number) => {
      const max = d.temperature_2m_max?.[i] ?? 0;
      const date = new Date(t + 'T00:00:00');
      const heatRisk = max >= 44 ? 'EXTREME' : max >= 41 ? 'SEVERE' : max >= 38 ? 'HIGH' : 'MODERATE';
      return {
        date: `${date.getDate()} ${date.toLocaleString('en', { month: 'short' })}`,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        maxTemp: +max.toFixed(1), minTemp: +(d.temperature_2m_min?.[i] ?? 0).toFixed(1),
        heatRisk, alert: max >= 44 ? 'RED ALERT' : max >= 41 ? 'HEAT ADVISORY' : 'STANDARD',
        precip: d.precipitation_sum?.[i] ?? 0, code: d.weather_code?.[i] ?? 0, source: 'Open-Meteo (live)',
      };
    });
  } catch {
    return null;
  } finally {
    clearTimeout(to);
  }
}

// Map WMO weather codes + cloud cover to one of the 4 simulation states.
export function cloudStateFromWeather(code: number, cover: number): string {
  if (code >= 51 || (code >= 71 && code <= 77) || (code >= 80 && code <= 99)) return 'monsoon';
  if (cover >= 70) return 'monsoon';
  if (cover >= 45) return 'haze';
  if (cover >= 20) return 'cirrus';
  return 'clear';
}

export const WMO_LABEL: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
  61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Snow', 73: 'Snow', 75: 'Snow',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Thunderstorm + hail',
};
export function wmoLabel(code: number): string { return WMO_LABEL[code] ?? `Code ${code}`; }
