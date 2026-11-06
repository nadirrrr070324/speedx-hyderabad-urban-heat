import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Crosshair, MapPin, MapPinOff, Navigation, RefreshCw, X } from 'lucide-react';
import type { Zone } from '../lib/types';
import { haversineKm, nearestZone, reverseLabel } from '../lib/location';
import { getCurrentFix, watchFix, type GeoFix } from '../lib/location';
import { Card, DemoBadge, SectionTitle, RiskPill } from './ui';
import { useA11y } from '../lib/a11y';

interface Props {
  zones: Zone[];
  active: Zone;
  onSelect: (id: string) => void;
  custom: Zone | null;
  onCustom: (z: Zone | null) => void;
  fix: GeoFix | null;
  watch: boolean;
  onWatch: (b: boolean) => void;
  onFix: (f: GeoFix | null) => void;
  geoState: string;
  onGeoState: (s: string) => void;
}

export default function LocationSwitch({ zones, active, onSelect, custom, onCustom, fix, watch, onWatch, onFix, geoState, onGeoState }: Props) {
  const { t } = useA11y();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const unwatch = useRef<(() => void) | null>(null);

  const locate = async () => {
    setBusy(true); setErr(null);
    try {
      const f = await getCurrentFix();
      onFix(f); onGeoState('granted');
      const lab = await reverseLabel(f.lat, f.lng);
      setLabel(lab);
      // Create a custom "My Location" zone so ALL dashboard data follows the user.
      const nz: Zone = {
        id: 'my-location', name: lab ? `My Location — ${lab}` : 'My Location',
        ward: `GPS ${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}`, lat: f.lat, lng: f.lng,
        area: `Live GPS fix · accuracy ±${Math.round(f.accuracy)} m`,
        env: { ...active.env, source: undefined }, // proxies replaced by live weather in App
        population: 0, vulnerability: 50, shelters: 0, waterPoints: 0, custom: true,
      };
      onCustom(nz); onSelect('my-location');
    } catch (e) {
      const msg = e instanceof GeolocationPositionError
        ? (e.code === e.PERMISSION_DENIED ? 'Location permission denied. Enable it in browser settings, or pick a zone below.'
          : e.code === e.POSITION_UNAVAILABLE ? 'Position unavailable (GPS off?). Try again or pick a zone.'
          : 'Location timed out. Try again or pick a zone.')
        : 'Geolocation not supported on this device.';
      setErr(msg); onGeoState(e instanceof GeolocationPositionError && e.code === e.PERMISSION_DENIED ? 'denied' : 'prompt');
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (watch) {
      unwatch.current = watchFix(f => { onFix(f); onGeoState('granted'); }, () => onGeoState('denied'));
    }
    return () => { unwatch.current?.(); unwatch.current = null; };
  }, [watch]);

  // Distance from user to each preset zone for the dropdown.
  const withDist = zones.map(z => ({ z, d: fix ? haversineKm(fix.lat, fix.lng, z.lat, z.lng) : null })).sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9));
  const nearest = fix ? nearestZone(fix.lat, fix.lng) : null;

  return (
    <Card>
      <SectionTitle kicker={t('loc.kicker')} title={t('loc.title')} right={<DemoBadge label={custom ? 'MY LOCATION · LIVE' : 'PRESET ZONES'} />} />
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={locate} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-xs font-bold tracking-widest text-white disabled:opacity-60 hover:bg-slate2/90">
            {busy ? <RefreshCw size={13} className="animate-spin" /> : <Crosshair size={13} />} {busy ? t('loc.locating') : t('loc.use')}
          </button>
          <button onClick={() => { onWatch(!watch); }} aria-pressed={watch} className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-xs font-bold tracking-widest ${watch ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-navy text-navy hover:bg-mist'}`}>
            <Navigation size={13} /> {watch ? t('loc.tracking') : t('loc.track')}
          </button>
          {geoState === 'denied' && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-critical"><MapPinOff size={13} /> {t('loc.denied')}</span>}
        </div>

        <div className="relative mt-3">
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left hover:bg-mist">
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-heat" />
              <span><span className="block text-xs font-bold text-navy">{active.name}</span><span className="block text-[10px] text-slate-500">{active.ward} · {active.lat.toFixed(4)}, {active.lng.toFixed(4)}</span></span>
            </span>
            <ChevronDown size={15} className={`text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute z-30 mt-1 w-full rounded-2xl border border-slate-200 bg-white card-shadow-lg p-1.5">
              {custom && (
                <button onClick={() => { onSelect(custom.id); setOpen(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold ${active.id === custom.id ? 'bg-orange-50 text-heat' : 'hover:bg-mist text-navy'}`}>
                  <span><Crosshair size={12} className="mr-1 inline" /> {custom.name}</span><span className="text-[10px] text-slate-400">GPS LIVE</span>
                </button>
              )}
              {withDist.map(({ z, d }) => (
                <button key={z.id} onClick={() => { onSelect(z.id); setOpen(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold ${active.id === z.id ? 'bg-orange-50 text-heat' : 'hover:bg-mist text-navy'}`}>
                  <span>{z.name}</span>
                  <span className="flex items-center gap-2"><RiskPill tier={z.env.riskBase >= 80 ? 'SEVERE' : z.env.riskBase >= 60 ? 'HIGH' : 'MODERATE'} />{d != null && <span className="text-[10px] text-slate-400">{d.toFixed(1)} km</span>}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {fix && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600"><Crosshair size={12} className="text-emerald-600" /> GPS {fix.lat.toFixed(4)}, {fix.lng.toFixed(4)} · ±{Math.round(fix.accuracy)} m · {fix.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {nearest && <span> · {t('loc.nearest')}: <b className="text-navy">{nearest.zone.name}</b> ({nearest.distKm.toFixed(1)} km)</span>}
            {label && <span> · <b className="text-navy">{label}</b></span>}
            <button onClick={() => { if (custom) { onCustom(null); onSelect(zones[0].id); } onFix(null); }} className="ml-auto inline-flex items-center gap-1 font-bold text-slate-400 hover:text-critical"><X size={12} /> {t('loc.clear')}</button>
          </p>
        )}
        {err && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold text-critical">{err}</p>}
        <p className="mt-2 text-[10px] text-slate-400">{t('loc.privacy')}</p>
      </div>
    </Card>
  );
}
