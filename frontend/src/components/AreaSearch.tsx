import { useMemo, useState } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';
import { HYDERABAD_AREAS, type AreaHit } from '../lib/data';
import type { Zone } from '../lib/types';
import { ZONES } from '../lib/data';
import { forwardGeocode } from '../lib/location';

interface GeoHit { city: string; locality: string; principalSubdivision: string; countryName: string; latitude: number; longitude: number; }

export default function AreaSearch({ onSelect, placeholder = 'Search any city or area…' }: { onSelect: (zone: Zone) => void; placeholder?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoResults, setGeoResults] = useState<GeoHit[]>([]);

  const quickHits = useMemo(() => HYDERABAD_AREAS.slice(0, 6), []);

  const baseEnv = ZONES[0].env;

  const pickFromArea = (a: AreaHit) => {
    const zone: Zone = {
      id: `area-${a.id}`, name: a.name, ward: a.ward, lat: a.lat, lng: a.lng, area: a.area,
      env: { ...baseEnv }, population: 0, vulnerability: 50, shelters: 0, waterPoints: 0, custom: true,
    };
    setOpen(false); setQ(''); setGeoResults([]);
    onSelect(zone);
  };

  const pickFromGeo = (g: GeoHit) => {
    const zone: Zone = {
      id: `geo-${g.latitude.toFixed(4)}-${g.longitude.toFixed(4)}`,
      name: g.city || g.locality || 'Selected location',
      ward: `${g.principalSubdivision}, ${g.countryName}`,
      lat: g.latitude, lng: g.longitude,
      area: `Live weather · ${g.city || g.locality}`,
      env: { ...baseEnv }, population: 0, vulnerability: 50, shelters: 0, waterPoints: 0, custom: true,
    };
    setOpen(false); setQ(''); setGeoResults([]);
    onSelect(zone);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
    setOpen(true);
    const term = e.target.value.trim();
    if (term.length < 2) { setGeoResults([]); return; }
    setLoading(true);
    try {
      const results = await forwardGeocode(term);
      setGeoResults(results);
    } catch { setGeoResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 mb-1">
        <Globe size={12} className="text-slate-400" /> SEARCH ANY CITY OR AREA WORLDWIDE
      </div>
      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
      <input value={q} onFocus={() => setOpen(true)} onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-heat focus:outline-none" />
      {loading && <span className="absolute right-3 top-2.5 text-[10px] animate-spin">⟳</span>}
      {open && (
        <div className="absolute z-40 mt-1 w-full max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white card-shadow-lg p-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 mb-1">Quick picks (Hyderabad)</div>
          {quickHits.map(a => (
            <button key={a.id} onClick={() => pickFromArea(a)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold hover:bg-mist">
              <MapPin size={12} className="text-heat shrink-0" />
              <span className="text-navy">{a.name}</span>
              <span className="ml-auto text-[10px] text-slate-400">{a.ward}</span>
            </button>
          ))}
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 mt-2 mb-1">Search results worldwide</div>
          {geoResults.length ? (
            geoResults.map((g, i) => (
              <button key={i} onClick={() => pickFromGeo(g)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold hover:bg-mist">
                <Globe size={12} className="text-slate-400 shrink-0" />
                <span className="text-navy">{g.city || g.locality}</span>
                <span className="ml-auto text-[10px] text-slate-400">{g.principalSubdivision}, {g.countryName}</span>
              </button>
            ))
          ) : q.trim().length >= 2 ? <p className="px-3 py-2 text-xs text-slate-500">No results found. Try another spelling.</p> : <p className="px-3 py-2 text-xs text-slate-500">Type a city or area name to search worldwide.</p>}
          <p className="px-3 py-1.5 text-[9px] text-slate-400">Weather loads live for the selected location (Open-Meteo). GIS layers remain DEMO proxies.</p>
        </div>
      )}
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
    </div>
  );
}
