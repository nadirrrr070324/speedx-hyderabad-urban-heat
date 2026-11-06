import { Globe } from 'lucide-react';
import type { Zone, RiskBreakdown, CloudState } from '../lib/types';
import type { LiveWeather } from '../lib/weather';
import { wmoLabel } from '../lib/weather';
import { Card, DemoBadge } from './ui';
import ThermalRadar from './ThermalRadar';
import CloudSky from './CloudSky';
import AreaSearch from './AreaSearch';

interface Props {
  zone: Zone;
  risk: RiskBreakdown;
  cloud: CloudState;
  setZone: (id: string) => void;
  onAreaSelect?: (zone: any) => void;
  liveWeather?: LiveWeather | null;
  liveLoading?: boolean;
  liveUpdated?: Date | null;
  onRefresh?: () => void;
}

export default function RedesignedOverview({ zone, risk, cloud, setZone, onAreaSelect, liveWeather, liveLoading, liveUpdated, onRefresh }: Props) {
  const e = zone.env;
  const live = e.source === 'Open-Meteo (live)';
  const adjTemp = e.coreTemp + (live ? 0 : cloud.tempDelta);
  const effUv = e.uvIndex * (1 - (live ? 0 : cloud.attenuation) / 100);
  const effSolar = e.solarWm2 * (1 - (live ? 0 : cloud.attenuation) / 100);

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      {/* SEARCH BAR — WORLDWIDE */}
      <Card className="p-5 bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-200 shadow-porcelain-card">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={14} className="text-orange-600" />
          <p className="text-[10px] font-extrabold text-orange-700 tracking-widest uppercase">GLOBAL METRO SEARCH — ANY CITY, ANYWHERE</p>
        </div>
        <AreaSearch onSelect={(z) => { onAreaSelect?.(z); setZone(z.id); }} />
        <p className="mt-2 text-[10px] text-slate-400">Currently viewing: <b className="text-orange-700">{zone.name}</b> · {zone.ward}</p>
      </Card>

      {/* 3-QUESTION QUICK SUMMARY */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5 porcelain-card border border-white shadow-porcelain-card">
          <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-2">1. WHAT'S HAPPENING?</p>
          <p className="font-display font-black text-4xl md:text-5xl text-obsidian leading-none">{adjTemp.toFixed(1)}°C</p>
          <p className="text-xs text-slate-600 mt-1">Heat index · {zone.name}</p>
        </Card>
        <Card className="p-5 porcelain-card border border-white shadow-porcelain-card">
          <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-2">2. AM I AT RISK?</p>
          <p className="font-display font-black text-4xl md:text-5xl text-orange-700 leading-none">{risk.total}/100</p>
          <p className="text-xs text-slate-600 mt-1">{risk.tier} personal risk</p>
        </Card>
        <Card className="p-5 porcelain-card border border-white shadow-porcelain-card">
          <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-2">3. WHAT SHOULD I DO?</p>
          <p className="mt-1 text-xs font-bold text-orange-700">Avoid outdoor work 11:00–16:00</p>
          <p className="text-xs text-slate-600">Safer window: before 10:30 AM</p>
        </Card>
      </div>
      {/* HERO + ATMOSPHERIC METRICS */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="relative overflow-hidden xl:col-span-2 p-5 porcelain-card border border-white shadow-porcelain-card">
          <div className="relative">
            <CloudSky cloud={cloud} className="opacity-70" />
            <div className="absolute -right-20 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-orange-200 to-orange-500/30 blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <DemoBadge label={live ? 'LIVE' : 'DEMO'} />
                <span className="text-[10px] font-bold tracking-widest text-slate-400">
                  {liveLoading ? 'Connecting…' : live ? `${wmoLabel(liveWeather?.code ?? 0).toUpperCase()} · GLOBAL` : 'DEMO DATA'}
                </span>
                {onRefresh && <button onClick={onRefresh} className="ml-auto rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-orange-700 border border-orange-200 hover:bg-mist">↻ Refresh live{liveUpdated ? ` · ${liveUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}</button>}
              </div>
              <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-obsidian leading-none">
                HEAT<span className="text-orange-700"> INTEL</span>
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                Current heat conditions for {zone.name} · {zone.ward}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-white bg-white/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Core Temp</p>
                  <p className="font-display font-black text-2xl text-obsidian">{adjTemp.toFixed(1)}°C</p>
                </div>
                <div className="p-3 rounded-xl border border-white bg-white/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Feels Like</p>
                  <p className="font-display font-black text-2xl text-orange-700">{e.feelsLike.toFixed(1)}°C</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="xl:col-span-1 space-y-3">
          <Card className="p-4 porcelain-card border border-white shadow-porcelain-card">
            <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-3">SOLAR & UV</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">UV Index</span>
                <span className="font-display font-black text-orange-700">{effUv.toFixed(1)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-300 to-orange-600" style={{ width: Math.min(100, (effUv / 11) * 100) + '%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Solar Radiation</span>
                <span className="font-display font-black text-orange-700">{Math.round(effSolar)} W/m²</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-200 to-orange-500" style={{ width: Math.min(100, (effSolar / 1000) * 100) + '%' }} />
              </div>
            </div>
          </Card>

          <Card className="p-4 porcelain-card border border-white shadow-porcelain-card">
            <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-3">WIND & HUMIDITY</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Wind Speed</span>
                <span className="font-display font-black text-obsidian">{e.windKmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Humidity</span>
                <span className="font-display font-black text-obsidian">{e.humidity}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* RADAR + PREVIEW */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 porcelain-card border border-white shadow-porcelain-card lg:col-span-2">
          <ThermalRadar zone={zone} cloud={cloud} />
        </Card>
      </div>
    </div>
  );
}

