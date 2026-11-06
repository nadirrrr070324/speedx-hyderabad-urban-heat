import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from './i18n';
import { t } from './i18n';

export interface A11ySettings {
  lang: Lang;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  focusRings: boolean;
}

const DEFAULTS: A11ySettings = {
  lang: 'en', highContrast: false, largeText: false, reduceMotion: false, focusRings: true,
};

const KEY = 'speedx-a11y';

function load(): A11ySettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<A11ySettings>) };
  } catch { /* ignore */ }
  // Respect OS preferences on first run
  const prefersContrast = window.matchMedia?.('(prefers-contrast: more)').matches;
  const prefersMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return { ...DEFAULTS, highContrast: !!prefersContrast, reduceMotion: !!prefersMotion };
}

interface Ctx {
  settings: A11ySettings;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  toggle: (k: keyof Omit<A11ySettings, 'lang'>) => void;
  speak: (text: string) => void;
  speaking: boolean;
  stopSpeak: () => void;
}

const A11yCtx = createContext<Ctx | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(load);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
    const r = document.documentElement;
    r.classList.toggle('a11y-contrast', settings.highContrast);
    r.classList.toggle('a11y-large', settings.largeText);
    r.classList.toggle('a11y-motion-off', settings.reduceMotion);
    r.classList.toggle('a11y-focus-off', !settings.focusRings);
    r.lang = settings.lang === 'ur' ? 'ur' : settings.lang;
    r.dir = settings.lang === 'ur' ? 'rtl' : 'ltr';
    document.title = settings.lang === 'en' ? 'SPEEDX — Hyderabad Urban Heat Observatory' : 'SPEEDX — హైదరాబాద్ / हैदराबाद / حیدرآباد अर्बन हीट ऑब्जर्वेटरी';
  }, [settings]);

  const speak = useCallback((text: string) => {
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ur: 'ur-IN' }[settings.lang];
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch { setSpeaking(false); }
  }, [settings.lang]);

  const stopSpeak = useCallback(() => { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } setSpeaking(false); }, []);

  const setLang = useCallback((l: Lang) => setSettings(s => ({ ...s, lang: l })), []);
  const toggle = useCallback((k: keyof Omit<A11ySettings, 'lang'>) => setSettings(s => ({ ...s, [k]: !s[k] })), []);

  return (
    <A11yCtx.Provider value={{ settings, t: (key: string) => t(settings.lang, key), setLang, toggle, speak, speaking, stopSpeak }}>
      {children}
    </A11yCtx.Provider>
  );
}

export function useA11y(): Ctx {
  const ctx = useContext(A11yCtx);
  if (!ctx) throw new Error('useA11y must be used inside A11yProvider');
  return ctx;
}
