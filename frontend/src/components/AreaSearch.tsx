import { useMemo, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { HYDERABAD_AREAS, type AreaHit } from '../lib/data';
import type { Zone } from '../lib/types';
import { ZONES } from '../lib/data';

export default function AreaSearch({ onSelect, placeholder = 'Search any area in Hyderabad…' }: { onSelect: (zone: Zone) => void; placeholder?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return HYDERABAD_AREAS.slice(0, 8);
    return HYDERABAD_AREAS.filter(a => a.name.toLowerCase().includes(term) || a.ward.toLowerCase().includes(term)).slice(0, 12);
  }, [q]);

  const pick = (a: AreaHit) => {
    const baseEnv = ZONES[0].env;
    const zone: Zone = {
      id: `area-${a.id}`,
      name: a.name,
      ward: a.ward,
      lat: a.lat,
      lng: a.lng,
      area: a.area,
      env: { ...baseEnv },
      population: 0, vulnerability: 50, shelters: 0, waterPoints: 0, custom: true,
    };
    setOpen(false); setQ('');
    onSelect(zone);
  };

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
      <input value={q} onFocus={() => setOpen(true)} onChange={e => { setQ(e.target.value); setOpen(true); }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-heat focus:outline-none" />
      {open && (
        <div className="absolute z-40 mt-1 w-full max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white card-shadow-lg p-1.5">
          {hits.length === 0 && <p className="px-3 py-2 text-xs text-slate-500">No area found. Try another spelling.</p>}
          {hits.map(a => (
            <button key={a.id} onClick={() => pick(a)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold hover:bg-mist">
              <MapPin size={12} className="text-heat shrink-0" />
              <span className="text-navy">{a.name}</span>
              <span className="ml-auto text-[10px] text-slate-400">{a.ward}</span>
            </button>
          ))}
          <p className="px-3 py-1.5 text-[9px] text-slate-400">Weather loads live for the selected area (Open-Meteo). GIS layers remain DEMO proxies.</p>
        </div>
      )}
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
    </div>
  );
}
