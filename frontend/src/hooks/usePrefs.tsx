import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type Quality = 'high' | 'low';

interface Prefs {
  /** Animacoes reduzidas (automatico por prefers-reduced-motion, com override manual) */
  reduce: boolean;
  toggleReduce: () => void;
  /** high = desktop capaz, low = mobile / maquina fraca */
  quality: Quality;
  /** Easter egg: modo hiper-neon */
  hyper: boolean;
  toggleHyper: () => void;
}

const Ctx = createContext<Prefs>(null!);
const KEY = 'authverse:motion';

const detectQuality = (): Quality =>
  window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'low' : 'high';

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [reduce, setReduce] = useState(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === 'reduced') return true;
    if (saved === 'full') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [hyper, setHyper] = useState(false);
  const [quality, setQuality] = useState<Quality>(detectQuality);

  useEffect(() => {
    const onResize = () => setQuality(detectQuality());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reduce ? 'reduced' : 'full';
    localStorage.setItem(KEY, reduce ? 'reduced' : 'full');
  }, [reduce]);

  useEffect(() => {
    document.documentElement.classList.toggle('hyper', hyper);
  }, [hyper]);

  const value = useMemo<Prefs>(
    () => ({
      reduce,
      quality,
      hyper,
      toggleReduce: () => setReduce((v) => !v),
      toggleHyper: () => setHyper((v) => !v),
    }),
    [reduce, quality, hyper],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePrefs = () => useContext(Ctx);
