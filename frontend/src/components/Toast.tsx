import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
interface T { id: number; kind: Kind; msg: string }
const Ctx = createContext<(kind: Kind, msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

const LOOK = {
  success: { Icon: CheckCircle2, border: 'border-emerald-400/40', icon: 'text-emerald-300', bar: 'bg-emerald-300' },
  error: { Icon: AlertTriangle, border: 'border-rose-400/40', icon: 'text-rose-300', bar: 'bg-rose-400' },
  info: { Icon: Info, border: 'border-cyan-400/40', icon: 'text-cyan-300', bar: 'bg-cyan-300' },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<T[]>([]);
  const push = useCallback((kind: Kind, msg: string) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l.slice(-3), { id, kind, msg }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {list.map((t) => {
            const look = LOOK[t.kind];
            const Icon = look.Icon;
            return (
              <motion.div
                key={t.id}
                layout
                role="status"
                initial={{ opacity: 0, x: 90, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 90, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                className={`glass relative overflow-hidden border px-4 py-3 ${look.border}`}
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${look.icon}`} />
                  <p className="text-sm text-slate-100">{t.msg}</p>
                </div>
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 4.2, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 ${look.bar}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
