import { useState } from 'react';
import { Crosshair, MapPinOff, RefreshCw } from 'lucide-react';
import { getCurrentFix, detectPermission } from '../lib/location';
import type { GeoFix } from '../lib/location';
import type { Zone } from '../lib/types';

// Compact header button: one tap to fetch GPS and jump to "My Location".
export default function LocationQuickBtn({ onFix, custom, onCustom, onSelect, geoState, onGeoState, zones }: {
  onFix: (f: GeoFix | null) => void;
  custom: Zone | null;
  onCustom: (z: Zone | null) => void;
  onSelect: (id: string) => void;
  geoState: string;
  onGeoState: (s: string) => void;
  zones: Zone[];
}) {
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      const f = await getCurrentFix();
      onFix(f); onGeoState('granted');
      const nz: Zone = {
        id: 'my-location', name: 'My Location', ward: `GPS ${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}`,
        lat: f.lat, lng: f.lng, area: `Live GPS fix · ±${Math.round(f.accuracy)} m`,
        env: zones[0].env, population: 0, vulnerability: 50, shelters: 0, waterPoints: 0, custom: true,
      };
      onCustom(nz);
      onSelect('my-location');
    } catch (e) {
      const denied = e instanceof GeolocationPositionError && e.code === e.PERMISSION_DENIED;
      onGeoState(denied ? 'denied' : await detectPermission());
    } finally { setBusy(false); }
  };

  if (geoState === 'denied') {
    return <button aria-label="Location permission denied" title="Location permission denied — enable in browser settings" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 border border-red-200 text-critical"><MapPinOff size={15} /></button>;
  }
  return (
    <button aria-label="Use my location" onClick={go} disabled={busy} className={`grid h-8 w-8 place-items-center rounded-full border ${custom ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 hover:bg-mist'}`} title={custom ? 'Using My Location' : 'Use my location'}>
      {busy ? <RefreshCw size={15} className="animate-spin" /> : <Crosshair size={15} />}
    </button>
  );
}
