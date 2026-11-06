import { useState } from 'react';
import { Accessibility, Contrast, Eye, Languages, Pause, Type, Volume2, X, Zap } from 'lucide-react';
import { useA11y } from '../lib/a11y';
import { LANGS, type Lang } from '../lib/i18n';

// Accessibility toolbar: language (EN/HI/TE/UR), high contrast, large text, reduce motion, focus rings, voice output.
export default function A11yBar() {
  const { settings, t, setLang, toggle, speak, speaking, stopSpeak } = useA11y();
  const [open, setOpen] = useState(false);

  const readPage = () => {
    const main = document.querySelector('main');
    const text = (main?.innerText ?? '').slice(0, 4000);
    if (speaking) stopSpeak(); else speak(text || t('foot.tag'));
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-72 rounded-2xl border border-slate-200 bg-white card-shadow-lg p-3" role="dialog" aria-label={t('a11y.title')}>
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-navy"><Accessibility size={14} className="text-heat" /> {t('a11y.title')}</p>
            <button onClick={() => setOpen(false)} aria-label={t('a11y.close')} className="grid h-7 w-7 place-items-center rounded-full hover:bg-mist"><X size={14} /></button>
          </div>

          <p className="text-[10px] font-bold tracking-widest text-slate-400">{t('a11y.language').toUpperCase()}</p>
          <div className="mt-1 flex flex-wrap gap-1" role="radiogroup" aria-label={t('a11y.language')}>
            {LANGS.map(l => (
              <button key={l.id} role="radio" aria-checked={settings.lang === l.id} onClick={() => setLang(l.id as Lang)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${settings.lang === l.id ? 'bg-navy text-white' : 'bg-mist text-slate-600 hover:bg-slate-200'}`}>{l.label}</button>
            ))}
          </div>

          <div className="mt-3 space-y-1.5">
            <ToggleRow on={settings.highContrast} onClick={() => toggle('highContrast')} icon={Contrast} label={t('a11y.highContrast')} />
            <ToggleRow on={settings.largeText} onClick={() => toggle('largeText')} icon={Type} label={t('a11y.largeText')} />
            <ToggleRow on={settings.reduceMotion} onClick={() => toggle('reduceMotion')} icon={Pause} label={`${t('a11y.reduceMotion')} (${settings.reduceMotion ? t('a11y.motionOff') : t('a11y.motionOn')})`} />
            <ToggleRow on={settings.focusRings} onClick={() => toggle('focusRings')} icon={Zap} label={t('a11y.focus')} />
          </div>

          <button onClick={readPage} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-2 text-xs font-bold text-white hover:bg-slate2/90">
            <Volume2 size={13} /> {speaking ? '⏹ Stop' : `${t('a11y.speak')} (${t('a11y.voice')})`}
          </button>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400"><Eye size={11} /> {t('a11y.voice')}: reads the current page aloud in the selected language.</p>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={t('a11y.title')} className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white card-shadow-lg ring-2 ring-white hover:bg-slate2/90">
        <Languages size={18} />
      </button>
    </div>
  );
}

function ToggleRow({ on, onClick, icon: Icon, label }: { on: boolean; onClick: () => void; icon: typeof Eye; label: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold ${on ? 'border-heat bg-orange-50 text-navy' : 'border-slate-200 text-slate-600 hover:bg-mist'}`}>
      <span className="inline-flex items-center gap-2"><Icon size={13} className="text-heat" /> {label}</span>
      <span className={`inline-block h-4 w-8 rounded-full p-0.5 ${on ? 'bg-heat' : 'bg-slate-300'}`}><span className={`block h-3 w-3 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`} /></span>
    </button>
  );
}
