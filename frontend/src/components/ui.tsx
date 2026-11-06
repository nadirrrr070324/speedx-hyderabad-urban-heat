import type { ReactNode } from 'react';

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`glass card-shadow rounded-2xl border border-white/60 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ kicker, title, right }: { kicker?: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
      <div>
        {kicker && <p className="text-[10px] font-bold tracking-[0.22em] text-heat">{kicker}</p>}
        <h2 className="font-headline text-sm font-bold tracking-wide text-navy">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function DemoBadge({ label = 'DEMO' }: { label?: string }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold tracking-widest text-amber-700 border border-amber-200">{label}</span>;
}

export function RiskPill({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    MODERATE: 'bg-amber-100 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    SEVERE: 'bg-red-100 text-red-700 border-red-200',
    EXTREME: 'bg-critical text-white border-critical',
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest border ${styles[tier] ?? styles.MODERATE}`}>{tier}</span>;
}

export function Gauge({ value, max = 100, color = '#EF233C' }: { value: number; max?: number; color?: string }) {
  const r = 32; const c = 2 * Math.PI * r; const p = Math.min(1, value / max);
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
      <circle cx="40" cy="40" r={r} stroke="#E8EEF5" strokeWidth="8" fill="none" />
      <circle cx="40" cy="40" r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} />
    </svg>
  );
}

export function Bar({ label, value, max = 100, display }: { label: string; value: number; max?: number; display?: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-slate-600"><span>{label}</span><span>{display ?? `${value}`}</span></div>
      <div className="mt-1 h-2 rounded-full bg-mist overflow-hidden">
        <div className="h-full heat-bar rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
