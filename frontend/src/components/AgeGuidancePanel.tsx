import { AlertTriangle, Baby, Droplets, HeartPulse, ShieldCheck, User, Users } from 'lucide-react';
import type { Profile } from '../lib/types';
import { guidanceForAge } from '../lib/ageGuidance';
import { Card, SectionTitle } from './ui';
import { useA11y } from '../lib/a11y';

// Age-specific precautions & suggestions. General preventive guidance — NOT medical prescriptions.

const AGE_ICON: Record<string, typeof Baby> = {
  'Under 18': Baby, '18-30': User, '30-45': Users, '45-60': HeartPulse, '60+': ShieldCheck,
};

export default function AgeGuidancePanel({ profile }: { profile: Profile }) {
  const { t } = useA11y();
  const g = guidanceForAge(profile.ageRange);
  const Icon = AGE_ICON[profile.ageRange] ?? User;
  return (
    <Card>
      <SectionTitle kicker="AGE-SPECIFIC GUIDANCE" title={`PRECAUTIONS FOR ${g.label.toUpperCase()}`} right={<span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-heat border border-orange-200"><Icon size={17} /></span>} />
      <div className="px-4 pb-4">
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-semibold text-amber-800">General preventive guidance — not medical advice or a prescription. Consult a doctor for personal medical decisions.</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400"><Droplets size={12} className="text-heat" /> HYDRATION</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{g.hydration}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400"><AlertTriangle size={12} className="text-heat" /> OUTDOOR LIMIT</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{g.outdoorLimit}</p>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-600"><b className="text-navy">Why this age group needs extra care:</b> {g.why}</p>

          <h3 className="mt-3 text-[10px] font-bold tracking-widest text-navy">{t('a11y.speak') === 'सुनें' ? 'दैनिक सावधानियां' : 'DAILY PRECAUTIONS'}</h3>
        <ul className="mt-1.5 space-y-1.5">
          {g.precautions.map(p => <li key={p} className="flex gap-2 rounded-lg bg-white/70 border border-slate-200/70 px-3 py-2 text-[11px] text-slate-700"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-600" />{p}</li>)}
        </ul>

        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-[11px] font-bold text-critical">{g.neverDo}</p>
        </div>

        <h3 className="mt-3 text-[10px] font-bold tracking-widest text-navy">WARNING SIGNS — ACT FAST</h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {g.warningSigns.map(s => <span key={s} className="rounded-full bg-white border border-red-200 px-2.5 py-1 text-[10px] font-semibold text-red-700">{s}</span>)}
        </div>
        <p className="mt-2 text-[11px] font-bold text-critical">{g.emergency}</p>
      </div>
    </Card>
  );
}
