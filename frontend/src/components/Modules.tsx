import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { MapPin, Search, Building2, Users, TreePine, Droplets, HardHat, Clock, ShieldCheck } from 'lucide-react';
import type { Zone, Profile, ForecastDay } from '../lib/types';
import { FACILITIES, demoForecast } from '../lib/data';
import { haversineKm } from '../lib/location';
import { ZONES } from '../lib/data';
import { assessRisk } from '../lib/risk';
import { Card, DemoBadge, SectionTitle, RiskPill, Bar as BarRow } from './ui';
import ThermalGISMap, { type MapLayer } from './ThermalGISMap';
import AreaSearch from './AreaSearch';

/* ---------- Thermal GIS (real Leaflet map + multi-layer) ---------- */
export function ThermalGIS({ zones, zone, setZone, onAreaSelect }: { zones: Zone[]; zone: Zone; setZone: (id: string) => void; onAreaSelect?: (z: Zone) => void }) {
  const [layer, setLayer] = useState<MapLayer>('thermal');
  const [query, setQuery] = useState('');
  const filtered = zones.filter(z => z.name.toLowerCase().includes(query.toLowerCase()) || z.ward.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="THERMAL GIS" title="HYDERABAD — REAL MAP, MULTI-LAYER" right={<DemoBadge label="LIVE MAP · DEMO LAYERS" />} />
        <div className="grid gap-4 px-4 pb-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-2">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">SEARCH AREA</p>
              <AreaSearch onSelect={(z) => { onAreaSelect?.(z); setZone(z.id); }} placeholder="Search any Hyderabad area…" />
            </div>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ward / zone…" className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-heat focus:outline-none" />
            </div>
            <ThermalGISMap zones={zones} zone={zone} setZone={setZone} layer={layer} onLayer={setLayer} />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest text-navy">WARD RISK RANKING</h3>
            <div className="mt-2 space-y-2">
              {filtered.slice().sort((a, b) => b.env.riskBase - a.env.riskBase).map((z, i) => (
                <button key={z.id} onClick={() => setZone(z.id)} className={`w-full rounded-xl border p-3 text-left ${zone.id === z.id ? 'border-heat bg-orange-50' : 'border-slate-200 bg-white/70 hover:bg-mist'}`}>
                  <p className="flex items-center justify-between text-xs font-bold text-navy"><span>#{i + 1} {z.name}</span><RiskPill tier={z.env.riskBase >= 80 ? 'SEVERE' : z.env.riskBase >= 60 ? 'HIGH' : 'MODERATE'} /></p>
                  <p className="mt-1 text-[10px] text-slate-500">LST proxy {z.env.lst.toFixed(1)}°C · NDVI {z.env.ndvi} · Built-up {Math.round(z.env.builtup * 100)}%</p>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-mist p-3 text-[11px] leading-relaxed text-slate-600">
              <b className="text-navy">LST vs air temperature:</b> satellite Land Surface Temperature measures the heat radiating from roofs/roads (can exceed 50°C), while human-experienced air temperature is what you feel at 1.5m. SPEEDX combines both — never confuse the two.
            </div>
            <div className="mt-3 rounded-xl bg-mist p-3 text-[11px] leading-relaxed text-slate-600">
              <b className="text-navy">Map sources:</b> base maps © OpenStreetMap / Esri World Imagery. Heat, LST, NDVI and humidity overlays are DEMO proxies until Earth Engine / PostGIS rasters are connected — they are <b>not</b> satellite imagery.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Vulnerability Model (interactive) ---------- */
export function VulnerabilityModel({ profile, zone }: { profile: Profile; zone: Zone }) {
  const baseRisk = assessRisk(profile, zone);
  const [hours, setHours] = useState(profile.outdoorHours);
  const [shade, setShade] = useState(profile.shadeAccess);
  const [activity, setActivity] = useState(profile.activity);
  const scenarioProfile = { ...profile, outdoorHours: hours, shadeAccess: shade, activity };
  const risk = assessRisk(scenarioProfile, zone);
  const data = [
    { name: 'Hazard', value: risk.hazard, max: 50 },
    { name: 'Exposure', value: risk.exposure, max: 30 },
    { name: 'Vulnerability', value: risk.vulnerability, max: 20 },
  ];
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="EXPLAINABLE AI" title="VULNERABILITY MODEL — EXPLORE YOUR RISK" right={<DemoBadge label="DEMO MODEL" />} />
        <div className="grid gap-4 px-4 pb-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 50]} /><YAxis type="category" dataKey="name" width={110} />
                <Tooltip /><Bar dataKey="value" fill="#F97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-500">Baseline weighted model (SHAP-ready feature schema). Not a trained ML model — labelled DEMO.</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-navy">INTERACTIVE SCENARIO</h3>
            <div className="rounded-xl bg-mist p-3 text-[11px] text-slate-600">
              Adjust the sliders to see how your risk changes. Current: <b className="text-navy">{risk.total}/100 ({risk.tier})</b>
              {risk.total !== baseRisk.total && <span className="ml-1 text-heat">(baseline {baseRisk.total})</span>}
            </div>
            <label className="block text-xs font-semibold text-navy">Outdoor hours: {hours}h
              <input type="range" min={0} max={12} value={hours} onChange={e => setHours(+e.target.value)} className="w-full accent-heat" />
            </label>
            <label className="block text-xs font-semibold text-navy">Activity level
              <select value={activity} onChange={e => setActivity(e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
                {['low','moderate','high','very_high'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-navy">
              <input type="checkbox" checked={shade} onChange={e => setShade(e.target.checked)} className="accent-heat" /> Shade access
            </label>
            <h3 className="text-xs font-bold tracking-widest text-navy mt-2">TOP CONTRIBUTORS</h3>
            {risk.factors.slice(0, 6).map(f => <BarRow key={f.label} label={f.label} value={Math.abs(f.contribution)} max={12} display={`${f.contribution > 0 ? '+' : ''}${f.contribution} — ${f.note}`} />)}
            <p className="rounded-xl bg-mist p-3 text-[11px] text-slate-600">Model inputs: LST proxy {zone.env.lst}°C, NDVI {zone.env.ndvi}, built-up {Math.round(zone.env.builtup * 100)}%, heat index {zone.env.heatIndex}°C, wet-bulb {zone.env.wetBulb}°C, UV {zone.env.uvIndex}. Swap in Random Forest / XGBoost + SHAP when labelled training data is available.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Cool Shelters ---------- */
export function CoolShelters({ zone }: { zone: Zone }) {
  const [q, setQ] = useState(''); const [type, setType] = useState('all');
  // Find nearest preset zone with facilities (fallback for custom/searched locations).
  const nearestZone = useMemo(() => {
    if (ZONES.some(z => z.id === zone.id)) return ZONES.find(z => z.id === zone.id)!;
    let best = ZONES[0], bestD = Infinity;
    for (const z of ZONES) { const d = haversineKm(zone.lat, zone.lng, z.lat, z.lng); if (d < bestD) { bestD = d; best = z; } }
    return best;
  }, [zone]);
  const usingFallback = nearestZone.id !== zone.id;
  const baseList = FACILITIES.filter(f => f.zoneId === nearestZone.id);
  const list = baseList
    .map(f => ({ ...f, distanceKm: +haversineKm(zone.lat, zone.lng, nearestZone.lat + f.distanceKm * 0.004, nearestZone.lng + f.distanceKm * 0.004).toFixed(2) }))
    .filter(f => (type === 'all' || f.type === type) && f.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="COOL SHELTERS" title={`NEAR ${zone.name.toUpperCase()}`} right={<DemoBadge />} />
        {usingFallback && <p className="px-4 pb-2 text-[11px] text-amber-700">No facility data for this exact area — showing nearest mapped zone: <b>{nearestZone.name}</b>. Distances are approximate.</p>}
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-2.5 text-slate-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search facilities…" className="w-full rounded-full border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-heat focus:outline-none" /></div>
          {['all', 'shelter', 'hospital', 'park', 'water'].map(t => <button key={t} onClick={() => setType(t)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${type === t ? 'bg-navy text-white' : 'bg-mist text-slate-600'}`}>{t}</button>)}
        </div>
        <div className="grid gap-2 px-4 pb-5 sm:grid-cols-2">
          {list.map(f => (
            <div key={f.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mist text-heat"><MapPin size={16} /></span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-navy">{f.name}</p>
                <p className="text-[10px] capitalize text-slate-500">{f.type} · {f.distanceKm} km · <b className={f.status === 'OPEN' ? 'text-emerald-600' : 'text-amber-600'}>{f.status}</b>{f.capacity ? ` · ${f.capacity}` : ''}</p>
                <p className="text-[10px] text-slate-400">{f.note}</p>
              </div>
            </div>
          ))}
          {!list.length && <p className="px-4 pb-2 text-xs text-slate-500">No facilities match. Widen the search or switch type.</p>}
        </div>
        <p className="px-4 pb-4 text-[10px] text-slate-400">DEMO facility entries — verify with GHMC / OpenStreetMap before use. Production: Overpass API + PostGIS facilities table.</p>
      </Card>
    </div>
  );
}

/* ---------- Municipality ---------- */
export function Municipality({ zones }: { zones: Zone[] }) {
  const ranked = useMemo(() => zones.map(z => ({ z, priority: Math.round(z.env.riskBase * 0.5 + z.vulnerability * 0.3 + (z.population / 100000) * 10 - z.shelters * 4) })).sort((a, b) => b.priority - a.priority), [zones]);
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="MUNICIPALITY DASHBOARD" title="INTERVENTION PRIORITY RANKING (AGGREGATE, ANONYMISED)" right={<DemoBadge />} />
        <div className="grid gap-2 px-4 pb-5 sm:grid-cols-2">
          {ranked.map(({ z, priority }, i) => (
            <div key={z.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="flex items-center justify-between text-xs font-bold text-navy"><span>#{i + 1} {z.name}</span><span className="font-headline text-lg text-critical">{priority}<span className="text-[10px] text-slate-400"> PRIORITY</span></span></p>
              <div className="mt-2 space-y-1.5">
                <BarRow label="Heat hazard" value={z.env.riskBase} />
                <BarRow label="Vulnerability" value={z.vulnerability} />
                <BarRow label="Exposed population (k)" value={Math.round(z.population / 1000)} max={150} />
                <BarRow label="Cooling coverage (shelters)" value={z.shelters} max={10} />
              </div>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500"><TreePine size={11} /> {z.env.ndvi < 0.2 ? 'Tree plantation priority: HIGH' : 'Tree plantation priority: MEDIUM'} · <Droplets size={11} /> Water points: {z.waterPoints}</p>
            </div>
          ))}
        </div>
        <p className="px-4 pb-4 text-[10px] text-slate-400">Priority = hazard×0.5 + vulnerability×0.3 + population factor − shelter coverage. Aggregate demo data only — no individual health profiles.</p>
      </Card>
    </div>
  );
}

/* ---------- Employer ---------- */
export function Employer({ profile, zone }: { profile: Profile; zone: Zone }) {
  const risk = assessRisk(profile, zone);
  const schedule = [
    { slot: '05:00–10:00', risk: 'LOW', note: 'Best window — schedule heavy work' },
    { slot: '10:00–13:00', risk: 'MODERATE', note: 'Light duties, shade breaks every 45 min' },
    { slot: '13:00–16:00', risk: 'SEVERE', note: 'Suspend outdoor work — peak thermal load' },
    { slot: '16:00–19:00', risk: 'HIGH', note: 'Resume with hydration + rest cycles' },
  ];
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="EMPLOYER & WORKER SAFETY" title={`EXPOSURE PLAN — ${zone.name.toUpperCase()}`} right={<DemoBadge />} />
        <div className="grid gap-3 px-4 pb-5 sm:grid-cols-3">
          <Stat icon={HardHat} label="Worker risk score" value={`${risk.total}/100`} />
          <Stat icon={Clock} label="Safe window" value="05:00–10:00" />
          <Stat icon={ShieldCheck} label="Rest cycle" value="20 min / hour" />
        </div>
        <div className="space-y-2 px-4 pb-5">
          {schedule.map(s => (
            <div key={s.slot} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5">
              <span className="font-headline text-sm font-extrabold text-navy">{s.slot}</span><RiskPill tier={s.risk} /><span className="text-xs text-slate-600">{s.note}</span>
            </div>
          ))}
        </div>
        <p className="px-4 pb-4 text-[10px] text-slate-400">Aggregated workforce guidance only. Individual health conditions are never exposed in employer views.</p>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white/70 p-4"><Icon size={16} className="text-heat" /><p className="font-headline mt-1 text-xl font-extrabold text-navy">{value}</p><p className="text-[10px] font-bold tracking-widest text-slate-400">{label.toUpperCase()}</p></div>;
}

/* ---------- Forecast detail (live when available) ---------- */
export function ForecastDetail({ zone, liveForecast }: { zone: Zone; liveForecast?: ForecastDay[] }) {
  const demo = useMemo(() => demoForecast(zone), [zone]);
  const forecast = liveForecast?.length ? liveForecast : demo;
  const live = !!liveForecast?.length;
  const hourly = useMemo(() => Array.from({ length: 24 }, (_, h) => {
    const curve = Math.max(28, zone.env.coreTemp - Math.abs(14 - h) * 0.9);
    return { hour: `${String(h).padStart(2, '0')}:00`, temp: +curve.toFixed(1), risk: curve >= 40 ? 90 : curve >= 36 ? 65 : 35 };
  }), [zone]);
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="7-DAY OUTLOOK — DETAIL" title={`HOURLY HEAT RISK — ${zone.name.toUpperCase()}`} right={<DemoBadge />} />
        <div className="px-4 pb-2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={hourly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="temp" stroke="#F97316" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="risk" stroke="#EF233C" strokeWidth={1.5} dot={false} strokeDasharray="4 3" /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-2 px-4 pb-5 sm:grid-cols-3">
          {forecast.slice(0, 3).map(f => (
            <div key={f.date} className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-center">
              <p className="text-xs font-bold text-navy">{f.dayName} · {f.date}</p><p className="font-headline text-2xl font-extrabold text-navy">{f.maxTemp.toFixed(1)}°C</p><div className="flex justify-center"><RiskPill tier={f.heatRisk} /></div>
              {f.precip ? <p className="mt-1 text-[10px] text-sky-600">☂ {f.precip} mm</p> : null}
            </div>
          ))}
        </div>
        <p className="px-4 pb-4 text-[11px] text-slate-600"><Building2 size={12} className="inline" /> Safest outdoor window today: <b>before 10:30 AM</b>. Peak risk 12:00–16:00. {live ? 'Daily forecast is <b>live</b> from Open-Meteo; hourly curve is the DEMO diurnal model.' : 'Demo forecast — Open-Meteo unavailable.'}</p>
      </Card>
    </div>
  );
}
