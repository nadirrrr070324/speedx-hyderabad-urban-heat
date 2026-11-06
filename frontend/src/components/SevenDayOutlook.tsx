import { CloudSun, Sun, TriangleAlert } from 'lucide-react';
import type { ForecastDay } from '../lib/types';
import { Card, DemoBadge, RiskPill, SectionTitle } from './ui';

export default function SevenDayOutlook({ forecast, onDetail }: { forecast: ForecastDay[]; onDetail: () => void }) {
  return (
    <Card className="mx-3 mb-4 mt-4 sm:mx-5">
      <SectionTitle kicker="FORECAST" title="7-DAY HEAT OUTLOOK" right={<button onClick={onDetail} className="text-xs font-bold text-heat hover:underline">Hourly detail →</button>} />
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
        {forecast.map(f => (
          <div key={f.date} className={`min-w-[128px] rounded-2xl border p-3 text-center ${f.alert === 'RED ALERT' ? 'border-critical bg-red-50' : 'border-slate-200 bg-white/70'}`}>
            <p className="text-[10px] font-bold tracking-widest text-slate-400">{f.dayName.toUpperCase()} · {f.date}</p>
            {f.weatherIcon === 'sun' ? <Sun size={20} className="mx-auto mt-2 text-amber-500" /> : <CloudSun size={20} className="mx-auto mt-2 text-slate-500" />}
            <p className="font-headline mt-1 text-2xl font-extrabold text-navy">{f.maxTemp.toFixed(1)}°C</p>
            <p className="text-[10px] text-slate-400">min {f.minTemp.toFixed(1)}°C</p>
            <div className="mt-1 flex justify-center"><RiskPill tier={f.heatRisk} /></div>
            {f.alert !== 'STANDARD' && <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold tracking-widest text-critical"><TriangleAlert size={10} /> {f.alert}</p>}
          </div>
        ))}
      </div>
      <p className="px-4 pb-3 text-[10px] text-slate-400">Demo forecast derived from zone core temp + deterministic offsets. Connect backend /weather/forecast (Open-Meteo) for live data. <DemoBadge /></p>
    </Card>
  );
}
