import { motion } from 'framer-motion';
import { ArrowRight, CloudSun, Droplets, Flame, Gauge as GaugeIcon, Radar, Sun, Thermometer, Wind } from 'lucide-react';
import type { Zone, Profile, RiskBreakdown, CloudState, ForecastDay } from '../lib/types';
import type { LiveWeather } from '../lib/weather';
import { wmoLabel } from '../lib/weather';
import { CLOUD_STATES } from '../lib/cloud';
import { Card, DemoBadge, RiskPill, SectionTitle, Bar } from './ui';
import { useA11y } from '../lib/a11y';
import ThermalRadar from './ThermalRadar';
import CloudSky from './CloudSky';

interface Props {
  zone: Zone;
  risk: RiskBreakdown;
  profile: Profile;
  cloud: CloudState;
  setCloud: (c: CloudState) => void;
  onCheckRisk: () => void;
  onExplore3D: () => void;
  setZone: (id: string) => void;
  zones: Zone[];
  liveWeather?: LiveWeather | null;
  liveForecast?: ForecastDay[];
  liveLoading?: boolean;
  liveUpdated?: Date | null;
  refreshTick?: number;
  autoCloud?: boolean;
  setAutoCloud?: (b: boolean) => void;
  onRefresh?: () => void;
}

export default function Overview({ zone, risk, profile, cloud, setCloud, onCheckRisk, onExplore3D, setZone, zones, liveWeather, liveLoading, liveUpdated, autoCloud, setAutoCloud, onRefresh }: Props) {
  const { t } = useA11y();
  const e = zone.env;
  const live = e.source === 'Open-Meteo (live)';
  const adjTemp = e.coreTemp + (live ? 0 : cloud.tempDelta);
  const adjRisk = risk;
  const effUv = e.uvIndex * (1 - (live ? 0 : cloud.attenuation) / 100);
  const effSolar = e.solarWm2 * (1 - (live ? 0 : cloud.attenuation) / 100);

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      {/* HERO + METRIC GRID */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="relative overflow-hidden xl:col-span-3">
          <CloudSky cloud={cloud} className="opacity-80" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 to-critical/20 blur-3xl" />
          <div className="relative p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <DemoBadge label={live ? t('hero.live') : 'DEMO'} />
              <span className="text-[10px] font-bold tracking-widest text-slate-400">
                {liveLoading ? t('hero.connecting') : live ? `${wmoLabel(liveWeather?.code ?? 0).toUpperCase()} · HYDERABAD` : t('hero.demo')}
              </span>
              {onRefresh && <button onClick={onRefresh} className="ml-auto rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-navy border border-slate-200 hover:bg-mist">↻ Refresh live{liveUpdated ? ` · ${liveUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}</button>}
            </div>
            <h1 className="font-headline mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight text-navy sm:text-6xl">
              {t('hero.title1')}<br /><span className="heat-text">{t('hero.title2')}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              {t('hero.desc')}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: t('hero.core'), v: `${adjTemp.toFixed(1)}°C`, icon: Thermometer },
                { l: t('hero.feels'), v: `${e.feelsLike.toFixed(1)}°C`, icon: Flame },
                { l: t('hero.uhi'), v: `+${e.uhiAnomaly.toFixed(1)}°C`, icon: GaugeIcon },
                { l: t('hero.wind'), v: `${(e.windKmh + cloud.windDrift).toFixed(0)} km/h`, icon: Wind },
              ].map(x => (
                <div key={x.l} className="rounded-xl bg-white/70 border border-slate-200/70 p-3">
                  <x.icon size={14} className="text-heat" />
                  <p className="font-headline mt-1 text-lg font-extrabold text-navy">{x.v}</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400">{x.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={onCheckRisk} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold tracking-widest text-white transition hover:bg-slate2/90">{t('hero.cta1')} <ArrowRight size={14} /></button>
              <button onClick={onExplore3D} className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-xs font-bold tracking-widest text-navy transition hover:bg-mist"><Radar size={14} /> {t('hero.cta2')}</button>
            </div>
          </div>
        </Card>

        {/* METRIC GRID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
          <MetricCard icon={Flame} title={t('m.heatIndex')} value={e.heatIndex.toFixed(1)} unit="°C" status={e.heatIndex >= 45 ? 'SEVERE' : 'HIGH'} tone="red"
            rows={[[t('m.feels'), `${e.feelsLike.toFixed(1)}°C`], [t('m.history'), '']]} />
          <MetricCard icon={GaugeIcon} title={t('m.risk')} value={String(adjRisk.total)} unit="/100" status={t(`tier.${adjRisk.tier}`)} tone={adjRisk.tier === 'SEVERE' ? 'red' : 'orange'}
            rows={[[t('m.hazard'), `${adjRisk.hazard}/50`], [t('m.exposure'), `${adjRisk.exposure}/30`], [t('m.vuln'), `${adjRisk.vulnerability}/20`]]} action={() => onCheckRisk()} />
          <MetricCard icon={Sun} title={t('m.solar')} value={effUv.toFixed(1)} unit="UV" status={effUv >= 11 ? 'EXTREME' : effUv >= 8 ? 'VERY HIGH' : 'MODERATE'} tone="amber"
            rows={[[t('m.radiation'), `${Math.round(effSolar)} W/m²`], [t('m.attenuation'), `${cloud.attenuation}%`]]} />
          <MetricCard icon={Droplets} title={t('m.wetbulb')} value={e.wetBulb.toFixed(1)} unit="°C" status={e.wetBulb >= 28 ? 'CRITICAL' : 'ELEVATED'} tone="orange"
            rows={[[t('m.humidity'), `${e.humidity}%`], [t('m.sweat'), e.wetBulb >= 28 ? t('m.sweatBad') : t('m.sweatOk')]]} />
        </div>
      </div>

      {/* CLOUD MATRIX + RADAR */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="relative overflow-hidden xl:col-span-2">
          <CloudSky cloud={cloud} className="opacity-60" />
          <div className="relative">
            <SectionTitle kicker={t('c.kicker')} title={t('c.title')} right={
            <div className="flex items-center gap-1.5">
              {autoCloud !== undefined && setAutoCloud && (
                <button onClick={() => setAutoCloud(!autoCloud)} aria-pressed={autoCloud} className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${autoCloud ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500'}`}>{autoCloud ? t('c.auto') : t('c.manual')}</button>
              )}
              <DemoBadge label={live ? t('c.live') : t('c.sim')} />
            </div>
          } />
            <div className="grid grid-cols-2 gap-2 px-4 pb-3">
              {CLOUD_STATES.map(s => (
                <button key={s.id} onClick={() => setCloud(s)} aria-pressed={cloud.id === s.id} className={`rounded-xl border p-3 text-left transition ${cloud.id === s.id ? 'border-heat bg-orange-50/90 ring-1 ring-heat' : 'border-slate-200 bg-white/70 hover:bg-mist'}`}>
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-navy"><CloudDial cloud={s} active={cloud.id === s.id} /> {s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.cover}% cover</p>
                </button>
              ))}
            </div>
            <div className="space-y-3 px-4 pb-4">
              <Bar label={t('c.cover')} value={cloud.cover} display={`${cloud.cover}%`} />
              <Bar label={t('c.atten')} value={cloud.attenuation} display={`${cloud.attenuation}%`} />
              <Bar label={t('c.windDrift')} value={cloud.windDrift} max={30} display={`${cloud.windDrift} km/h`} />
              <Bar label={t('c.turb')} value={cloud.turbulence} display={`${cloud.turbulence}/100`} />
            </div>
            <p className="px-4 pb-4 text-[11px] text-slate-500">{cloud.desc} Simulated core temp effect: <b className="text-navy">{cloud.tempDelta > 0 ? '+' : ''}{cloud.tempDelta}°C</b></p>
          </div>
        </Card>

        <Card className="overflow-hidden xl:col-span-3">
          <SectionTitle kicker="3D SATELLITE TWIN" title={`${zone.name.toUpperCase()} • ${t('r.title')}`} right={<span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500 ring-anim" /> {live ? t('r.live') : t('r.demo')}</span>} />
          <div className="px-4 pb-4">
            <ThermalRadar zone={zone} playing cloud={cloud} live={live} />
          </div>
        </Card>
      </div>

      {/* ZONE SELECTOR */}
      <Card>
        <SectionTitle kicker={t('z.kicker')} title={t('z.title')} right={<DemoBadge />} />
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
          {zones.map(z => (
            <button key={z.id} onClick={() => setZone(z.id)} aria-pressed={zone.id === z.id} className={`min-w-[210px] rounded-2xl border p-3 text-left transition ${zone.id === z.id ? 'border-heat bg-orange-50 ring-1 ring-heat' : 'border-slate-200 bg-white/70 hover:bg-mist'}`}>
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-navy">{z.name}</p><RiskPill tier={z.env.riskBase >= 80 ? 'SEVERE' : z.env.riskBase >= 60 ? 'HIGH' : 'MODERATE'} /></div>
              <p className="mt-1 text-[10px] text-slate-500">{z.ward}</p>
              <p className="font-headline mt-2 text-xl font-extrabold text-navy">{z.env.coreTemp.toFixed(1)}°C <span className="text-[10px] font-bold text-slate-400">CORE</span></p>
            </button>
          ))}
        </div>
      </Card>

      {/* PROFILE SNAPSHOT */}
      <Card>
          <SectionTitle kicker={t('p.kicker')} title={t('p.title')} right={<button onClick={onCheckRisk} className="text-xs font-bold text-heat hover:underline">{t('p.edit')}</button>} />
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {[profile.ageRange, profile.occupation, `${profile.outdoorHours}h outdoors/day`, profile.activity.replace('_', ' '), profile.shadeAccess ? 'Shade available' : 'No shade', `${profile.timeOfDay} exposure`].map(x => (
            <span key={x} className="rounded-full bg-mist px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">{x}</span>
          ))}
        </div>
      </Card>

      {liveWeather && (
        <Card>
          <SectionTitle kicker={t('live.kicker')} title={t('live.title')} right={<DemoBadge label={t('live.liveTag')} />} />
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4">
            {[
              [t('live.condition'), wmoLabel(liveWeather.code)],
              [t('live.cloud'), `${liveWeather.cloudCover}%`],
              [t('live.pressure'), `${liveWeather.pressure.toFixed(0)} hPa`],
              [t('live.winddir'), `${liveWeather.windDir.toFixed(0)}°`],
              [t('live.precip'), `${liveWeather.precipMm} mm`],
              [t('live.uv'), liveWeather.uv != null ? liveWeather.uv.toFixed(1) : '—'],
              [t('live.updated'), liveWeather.time.replace('T', ' ')],
              [t('live.source'), 'api.open-meteo.com'],
            ].map(([k, v]) => <div key={k} className="rounded-xl bg-white/70 border border-slate-200/70 p-3"><p className="font-headline text-base font-extrabold text-navy">{v}</p><p className="text-[10px] font-bold tracking-widest text-slate-400">{k.toUpperCase()}</p></div>)}
          </div>
        </Card>
      )}

      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="flex items-center gap-2 px-1 text-[11px] text-slate-500"><CloudSun size={13} /> {live ? 'Weather, cloud sky and radar are driven by live Open-Meteo data (auto mode). LST/NDVI/built-up layers remain DEMO proxies — no satellite feed connected.' : 'Showing DEMO data — Open-Meteo unavailable. Click ↻ Refresh live to retry.'}</motion.p>
    </div>
  );
}

// Mini cloud-density wheel: puff count scales with cover, rotation speed with wind, bob with turbulence.
function CloudDial({ cloud, active }: { cloud: CloudState; active: boolean }) {
  const puffs = Math.max(1, Math.round(cloud.cover / 14));
  const spin = cloud.windDrift >= 20 ? 'cloud-spin-fast' : 'cloud-spin-slow';
  const bob = cloud.turbulence >= 60 ? 'cloud-bob' : '';
  return (
    <span className="relative inline-block h-6 w-6 shrink-0" aria-hidden="true">
      <span className={`cloud-wheel absolute inset-0 rounded-full border ${active ? 'border-heat/60' : 'border-slate-300/70'}`} style={{ transform: `rotate(${cloud.cover * 1.8}deg)` }}>
        {Array.from({ length: puffs }).map((_, i) => {
          const a = (i / puffs) * Math.PI * 2;
          return <span key={i} className="absolute h-2 w-2.5 rounded-full bg-white shadow-sm" style={{ left: `calc(50% + ${Math.cos(a) * 7}px - 6px)`, top: `calc(50% + ${Math.sin(a) * 7}px - 5px)` }} />;
        })}
      </span>
      <span className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${active ? 'bg-heat' : 'bg-slate-400'} ${spin} ${bob}`} />
    </span>
  );
}

function MetricCard({ icon: Icon, title, value, unit, status, tone, rows, action }: {
  icon: typeof Flame; title: string; value: string; unit: string; status: string; tone: string; rows: [string, string][]; action?: () => void;
}) {
  const dot = tone === 'red' ? 'bg-critical' : tone === 'amber' ? 'bg-amber-500' : 'bg-heat';
  return (
    <Card className="p-4 transition hover:-translate-y-0.5 hover:card-shadow-lg">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-500"><Icon size={13} className="text-heat" /> {title.toUpperCase()}</p>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
      <p className="font-headline mt-2 text-3xl font-extrabold text-navy">{value}<span className="text-sm text-slate-400"> {unit}</span></p>
      <p className="text-[10px] font-bold tracking-widest text-critical">{status}</p>
      <div className="mt-2 space-y-1 border-t border-slate-200/70 pt-2">
        {rows.map(([k, v]) => <p key={k} className="flex justify-between text-[11px]"><span className="text-slate-500">{k}</span><span className="font-semibold text-navy">{v}</span></p>)}
      </div>
      {action && <button onClick={action} className="mt-2 text-[11px] font-bold text-heat hover:underline">Explainable breakdown →</button>}
    </Card>
  );
}
