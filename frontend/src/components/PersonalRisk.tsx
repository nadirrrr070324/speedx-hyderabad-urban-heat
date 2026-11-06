import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldAlert } from 'lucide-react';
import type { Profile, RiskBreakdown, Zone } from '../lib/types';
import { assessRisk, buildRecommendations, DISCLAIMER } from '../lib/risk';
import { useA11y } from '../lib/a11y';
import { Card, DemoBadge, Gauge, SectionTitle, Bar, RiskPill } from './ui';

const AGES = ['18-30', '30-45', '45-60', '60+', 'Under 18'];
const OCCS = ['Delivery / Gig worker', 'Construction', 'Street vendor', 'Agriculture / Outdoor labour', 'Security / Traffic', 'Student', 'Office / Indoor', 'Retired'];
const CONDS = ['Diabetes', 'Hypertension', 'Heart condition', 'Asthma / Respiratory', 'Kidney condition', 'Pregnancy', 'Taking heat-sensitive medication'];

export default function PersonalRisk({ profile, setProfile, zone, zones }: {
  profile: Profile; setProfile: (p: Profile) => void; zone: Zone; zones: Zone[];
}) {
  const { t, settings } = useA11y();
  const [consent, setConsent] = useState(false);
  const risk: RiskBreakdown = useMemo(() => assessRisk(profile, zone), [profile, zone]);
  const recs = useMemo(() => buildRecommendations(profile, zone, risk), [profile, zone, risk]);
  const color = risk.tier === 'SEVERE' ? '#EF233C' : risk.tier === 'HIGH' ? '#F97316' : risk.tier === 'MODERATE' ? '#F59E0B' : '#10B981';

  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });
  const toggleCond = (c: string) => update({ conditions: profile.conditions.includes(c) ? profile.conditions.filter(x => x !== c) : [...profile.conditions, c] });

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <Card>
        <SectionTitle kicker="HEAT-RISK ENGINE" title="PERSONAL HEAT-RISK ASSESSMENT" right={<DemoBadge />} />
        <div className="grid gap-6 px-4 pb-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Age range"><Select value={profile.ageRange} onChange={v => update({ ageRange: v })} options={AGES} /></Field>
            <Field label="Occupation"><Select value={profile.occupation} onChange={v => update({ occupation: v })} options={OCCS} /></Field>
            <Field label="Monitoring zone"><Select value={profile.zoneId} onChange={v => update({ zoneId: v })} options={zones.map(z => z.id)} labels={zones.map(z => z.name)} /></Field>
            <Field label={`Outdoor exposure: ${profile.outdoorHours} hours/day`}>
              <input type="range" min={0} max={14} step={0.5} value={profile.outdoorHours} onChange={e => update({ outdoorHours: +e.target.value })} className="w-full accent-[#FF5A1F]" aria-label="Outdoor hours" />
            </Field>
            <Field label="Activity intensity"><Select value={profile.activity} onChange={v => update({ activity: v as Profile['activity'] })} options={['low', 'moderate', 'high', 'very_high']} /></Field>
            <Field label="Time of day (main exposure)"><Select value={profile.timeOfDay} onChange={v => update({ timeOfDay: v as Profile['timeOfDay'] })} options={['morning', 'midday', 'evening']} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-navy"><input type="checkbox" checked={profile.shadeAccess} onChange={e => update({ shadeAccess: e.target.checked })} className="h-4 w-4 accent-[#FF5A1F]" /> Access to shade</label>
            <Field label="Hydration context"><Select value={profile.hydration} onChange={v => update({ hydration: v as Profile['hydration'] })} options={['low', 'regular', 'high']} /></Field>

            <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
              <label className="flex items-center gap-2 text-xs font-bold text-navy"><ShieldAlert size={13} className="text-heat" /> Optional health conditions <span className="font-normal text-slate-500">(consent-based, stored locally only)</span></label>
              <label className="mt-2 flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="accent-[#FF5A1F]" /> I consent to including optional health context in this demo calculation</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CONDS.map(c => (
                  <button key={c} disabled={!consent} onClick={() => toggleCond(c)} aria-pressed={profile.conditions.includes(c)} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 ${profile.conditions.includes(c) ? 'border-heat bg-orange-50 text-heat' : 'border-slate-300 text-slate-600'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4">
              <div className="relative"><Gauge value={risk.total} color={color} /><span className="absolute inset-0 grid place-items-center"><span className="text-center"><span className="font-headline block text-2xl font-extrabold text-navy">{risk.total}</span><span className="text-[9px] font-bold tracking-widest text-slate-400">/100</span></span></span></div>
              <div>
                <RiskPill tier={risk.tier} />
                <p className="mt-2 text-xs text-slate-500">{t('m.hazard')} {risk.hazard}/50 · {t('m.exposure')} {risk.exposure}/30 · {t('m.vuln')} {risk.vulnerability}/20</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Bar label={t('m.hazard')} value={risk.hazard} max={50} />
              <Bar label={t('m.exposure')} value={risk.exposure} max={30} />
              <Bar label={t('m.vuln')} value={risk.vulnerability} max={20} />
            </div>
            <h3 className="mt-5 text-xs font-bold tracking-widest text-navy">CONTRIBUTING FACTORS (EXPLAINABLE)</h3>
            <ul className="mt-2 space-y-1.5">
              {risk.factors.map(f => (
                <motion.li key={f.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-xs border border-slate-200/70">
                  <span><b className="text-navy">{f.label}</b> <span className="text-slate-500">— {f.note}</span></span>
                  <span className={`font-headline font-extrabold ${f.contribution < 0 ? 'text-emerald-600' : 'text-critical'}`}>{f.contribution > 0 ? '+' : ''}{f.contribution}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle kicker={t('rec.kicker')} title={t('rec.title')} />
        <div className="grid gap-2 px-4 pb-3 sm:grid-cols-2">
          {recs.map(r => (
            <div key={r.id} className={`rounded-xl border p-3 ${r.priority === 'critical' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white/70'}`}>
              <p className="flex items-center gap-1.5 text-xs font-bold text-navy"><Brain size={12} className="text-heat" /> {r.title} <span className="ml-auto text-[9px] font-bold tracking-widest text-slate-400">{r.audience}</span></p>
              <p className="mt-1 text-[11px] text-slate-600">{r.detail}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <p className="rounded-xl bg-mist px-3 py-2 text-[11px] font-semibold text-navy">{t('rec.hydrate')} · {t('rec.rest')} · {t('rec.saferWindow')}</p>
          <p className="mt-2 text-[11px] font-bold text-critical">{t('rec.emergency')}</p>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{DISCLAIMER}</p>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[11px] font-bold tracking-widest text-slate-500">{label.toUpperCase()}</span><div className="mt-1">{children}</div></label>;
}
function Select({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels?: string[] }) {
  return <select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy focus:border-heat focus:outline-none">{options.map((o, i) => <option key={o} value={o}>{labels?.[i] ?? o}</option>)}</select>;
}
