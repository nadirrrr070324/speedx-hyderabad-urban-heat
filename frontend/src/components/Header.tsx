import { useEffect, useState, type ReactNode } from 'react';
import { Bell, Flame, Menu, Sun, User, X } from 'lucide-react';
import { useA11y } from '../lib/a11y';

export type View = 'overview' | 'gis' | 'vulnerability' | 'shelters' | 'outlook' | 'municipality' | 'employer' | 'forecast';

const NAV: { id: View; key: string }[] = [
  { id: 'overview', key: 'nav.overview' },
  { id: 'gis', key: 'nav.gis' },
  { id: 'vulnerability', key: 'nav.vuln' },
  { id: 'shelters', key: 'nav.shelters' },
  { id: 'outlook', key: 'nav.outlook' },
];

const NOTIFS = [
  { t: 'Red Alert — Charminar Core', d: 'Heat index above 48°C. Avoid outdoor work 11:00–16:00.', time: '2h ago' },
  { t: 'Cool shelter capacity update', d: 'KBR refuge has spare capacity today (demo).', time: '5h ago' },
  { t: 'Forecast: Thu heat peak', d: 'Model projects +2.8°C above today on Thursday.', time: 'Yesterday' },
];

export default function Header({ view, setView, advisory, locationSlot }: { view: View; setView: (v: View) => void; advisory: string; locationSlot?: ReactNode }) {
  const { t } = useA11y();
  const [mobile, setMobile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 glass">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-3 py-3 sm:px-5">
        <button onClick={() => setView('overview')} className="flex items-center gap-2 text-left">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white"><Flame size={20} className="text-heat" /></span>
          <span className="leading-none">
            <span className="font-headline block text-2xl font-extrabold tracking-tight text-navy">SPEEDX <span className="heat-text">HEAT INTEL</span></span>
            <span className="block text-[10px] font-bold tracking-[0.18em] text-slate-500">HYDERABAD URBAN OBSERVATORY</span>
          </span>
        </button>

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${view === n.id ? 'bg-navy text-white' : 'text-slate-600 hover:bg-mist'}`}>{t(n.key)}</button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 md:inline-flex"><Sun size={13} /> {t('header.solar')}</span>
          <span className="hidden rounded-full bg-critical px-2.5 py-1 text-[10px] font-bold tracking-widest text-white sm:inline-block">{t('header.critical')}</span>
          <span className="hidden text-[11px] font-semibold text-slate-500 xl:block">{now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>

          <div className="relative">
            <button aria-label="Notifications" onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} className="relative grid h-10 w-10 place-items-center rounded-full bg-white border border-slate-200 hover:bg-mist">
              <Bell size={15} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-critical ring-anim" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white card-shadow-lg p-2 z-50">
                <p className="px-2 py-1 text-[10px] font-bold tracking-widest text-slate-400">{t('header.advisory')}</p>
                <p className="px-2 pb-2 text-xs font-semibold text-navy">{advisory}</p>
                {NOTIFS.map(n => (
                  <div key={n.t} className="rounded-xl px-2 py-2 hover:bg-mist">
                    <p className="text-xs font-bold text-navy">{n.t}</p>
                    <p className="text-[11px] text-slate-500">{n.d}</p>
                    <p className="text-[10px] text-slate-400">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {locationSlot}
          <div className="relative">
            <button aria-label="Profile" onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }} className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white"><User size={15} /></button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white card-shadow-lg p-2 z-50">
                <p className="px-2 py-1 text-xs font-bold text-navy">{t('header.profile')}</p>
                <p className="px-2 text-[11px] text-slate-500">{t('header.profileSub')}</p>
                <button onClick={() => { setProfileOpen(false); setView('vulnerability'); }} className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold hover:bg-mist">{t('header.editProfile')}</button>
                <button onClick={() => { setProfileOpen(false); setView('municipality'); }} className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold hover:bg-mist">{t('header.muni')}</button>
                <button onClick={() => { setProfileOpen(false); setView('employer'); }} className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold hover:bg-mist">{t('header.employer')}</button>
              </div>
            )}
          </div>

          <button aria-label="Menu" onClick={() => setMobile(m => !m)} className="grid h-10 w-10 place-items-center rounded-full bg-white border border-slate-200 lg:hidden">{mobile ? <X size={15} /> : <Menu size={15} />}</button>
        </div>
      </div>
      {mobile && (
        <nav className="border-t border-slate-200 px-3 py-2 lg:hidden" aria-label="Mobile">
          <div className="flex flex-wrap gap-1">
            {NAV.map(n => <button key={n.id} onClick={() => { setView(n.id); setMobile(false); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${view === n.id ? 'bg-navy text-white' : 'bg-mist'}`}>{t(n.key)}</button>)}
          </div>
        </nav>
      )}
    </header>
  );
}

