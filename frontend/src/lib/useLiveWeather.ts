import { useEffect, useRef, useState } from 'react';
import type { Zone, ZoneEnv, ForecastDay } from './types';
import { fetchLiveWeather, fetchLiveForecast, wetBulbApprox, heatIndexF, type LiveWeather } from './weather';
import { cloudStateFromLive } from './cloud';
import type { CloudState } from './cloud';

const LS_W = (id: string) => `speedx-w-${id}`;
const LS_F = (id: string) => `speedx-f-${id}`;

function readLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; } catch { return null; }
}
function writeLS(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}
const CACHE_TTL = 5 * 60 * 1000; // 5 min
const cache = new Map<string, { at: number; w: LiveWeather }>();
const fcCache = new Map<string, { at: number; f: ForecastDay[] }>();

export interface LiveState {
  liveZone: Zone | null; // zone with live env merged in (or null = demo)
  weather: LiveWeather | null;
  loading: boolean;
  forecast: ForecastDay[];
  cloudLive: CloudState | null; // live-derived cloud state (auto mode)
  lastUpdated: Date | null;
  offline: boolean;
}

export function useLiveWeather(zone: Zone, autoCloud: boolean, onCloud?: (c: CloudState) => void, refreshTick = 0): LiveState {
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudLive, setCloudLive] = useState<CloudState | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [offline, setOffline] = useState(false);
  const onCloudRef = useRef(onCloud);
  onCloudRef.current = onCloud;
  const autoRef = useRef(autoCloud);
  autoRef.current = autoCloud;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const now = Date.now();
      let w: LiveWeather | null = cache.get(zone.id)?.w ?? null;
      const fresh = w && now - (cache.get(zone.id)?.at ?? 0) < CACHE_TTL;
      let isOffline = false;
      if (!fresh) {
        try {
          w = await fetchLiveWeather(zone.lat, zone.lng);
          if (w) { cache.set(zone.id, { at: now, w }); writeLS(LS_W(zone.id), { at: now, w }); }
        } catch {
          w = null;
        }
      }
      if (!w) {
        const cached = readLS<{ at: number; w: LiveWeather }>(LS_W(zone.id));
        if (cached?.w) { w = cached.w; isOffline = true; }
      }
      if (cancelled) return;
      setWeather(w);
      setOffline(isOffline && !w ? false : isOffline);
      if (w) {
        setLastUpdated(new Date());
        const derived = cloudStateFromLive(w.cloudCover, w.code, w.windKmh);
        setCloudLive(derived);
        if (autoRef.current) onCloudRef.current?.(derived);
      }

      let f: ForecastDay[] | undefined = fcCache.get(zone.id)?.f;
      const fFresh = f && now - (fcCache.get(zone.id)?.at ?? 0) < CACHE_TTL;
      if (!fFresh) {
        try {
          const live = await fetchLiveForecast(zone.lat, zone.lng);
          if (live) {
            f = live.map(d => ({ ...d, weatherIcon: d.code >= 51 ? 'rain' : d.code >= 1 ? 'cloud-sun' : 'sun', heatRisk: d.heatRisk as ForecastDay['heatRisk'] }));
            fcCache.set(zone.id, { at: now, f });
            writeLS(LS_F(zone.id), { at: now, f });
          }
        } catch {
          // fall back to cached
        }
      }
      if (!f || !f.length) {
        const cached = readLS<{ at: number; f: ForecastDay[] }>(LS_F(zone.id));
        if (cached?.f) { f = cached.f; isOffline = true; }
      }
      if (!cancelled) { setForecast(f ?? []); setLoading(false); setOffline(isOffline); }
    };
    load();
    const id = setInterval(load, CACHE_TTL);
    return () => { cancelled = true; clearInterval(id); };
  }, [zone.id, zone.lat, zone.lng, refreshTick]);

  let liveZone: Zone | null = null;
  if (weather) {
    const liveEnv: ZoneEnv = {
      ...zone.env,
      coreTemp: weather.temp,
      feelsLike: weather.apparent,
      heatIndex: +heatIndexF(weather.temp, weather.humidity).toFixed(1),
      humidity: weather.humidity,
      wetBulb: +wetBulbApprox(weather.temp, weather.humidity).toFixed(1),
      uvIndex: weather.uv ?? zone.env.uvIndex,
      windKmh: weather.windKmh,
      windDir: weather.windDir,
      pressure: weather.pressure,
      cloudCover: weather.cloudCover,
      source: 'Open-Meteo (live)',
    };
    liveZone = { ...zone, env: liveEnv };
  }

  return { liveZone, weather, loading, forecast, cloudLive, lastUpdated, offline };
}
