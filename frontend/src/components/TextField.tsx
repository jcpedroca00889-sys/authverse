import { KeyboardEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowBigUp, Eye, EyeOff, LucideIcon } from 'lucide-react';
import { item } from '../animations/variants';

interface Props {
  label: string; icon: LucideIcon; value: string; onChange: (v: string) => void; onBlur: () => void;
  type?: string; error?: string; ok?: boolean; autoComplete?: string; maxLength?: number;
}
const SHAKE = [0, -8, 8, -5, 5, 0];

export default function TextField({ label, icon: Icon, value, onChange, onBlur, type = 'text', error, ok, autoComplete, maxLength }: Props) {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  const [caps, setCaps] = useState(false);
  const pw = type === 'password';
  const id = `f-${label.replace(/\s/g, '')}`;
  const float = focus || value.length > 0;

  const ring = error
    ? 'border-rose-500/70 shadow-[0_0_22px_-4px_rgba(244,63,94,.65)]'
    : focus
      ? 'border-cyan-400/80 shadow-[0_0_26px_-4px_rgba(34,211,238,.65)]'
      : 'border-white/10 hover:border-violet-400/40';

  const labelTone = error ? 'text-rose-300' : focus ? 'text-cyan-300' : 'text-slate-400';
  const capsCheck = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState('CapsLock'));

  return (
    <motion.div variants={item} className="space-y-1.5">
      <motion.div
        animate={{ x: error ? SHAKE : 0 }}
        transition={{ duration: 0.4 }}
        className={`relative flex items-center rounded-xl border bg-white/[0.04] transition-all duration-300 ${ring}`}
      >
        <Icon className={`ml-3.5 h-[18px] w-[18px] shrink-0 transition-colors ${focus ? 'text-cyan-300' : 'text-slate-500'}`} />
        <div className="relative flex-1">
          <input
            id={id}
            value={value}
            type={pw && show ? 'text' : type}
            autoComplete={autoComplete}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            placeholder=" "
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => { setFocus(false); setCaps(false); onBlur(); }}
            onKeyDown={capsCheck}
            onKeyUp={capsCheck}
            className="w-full bg-transparent px-3 pb-2 pt-6 text-sm outline-none placeholder:text-transparent"
          />
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-3 origin-left transition-all duration-300 ${labelTone} ${
              float ? 'top-[7px] text-[11px] font-medium tracking-wide' : 'top-1/2 -translate-y-1/2 text-sm'
            }`}
          >
            {label}
          </label>
        </div>

        {pw && (
          <button
            type="button"
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShow((s) => !s)}
            className="mr-3.5 text-slate-500 transition hover:text-cyan-300"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={show ? 'off' : 'on'}
                initial={{ opacity: 0, rotate: -25, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 25, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        )}

        {ok && !pw && (
          <svg viewBox="0 0 24 24" className="mr-3.5 h-[18px] w-[18px]" aria-hidden>
            <motion.path
              d="M4 12.5 9.5 18 20 6.5"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </svg>
        )}
      </motion.div>

      <AnimatePresence>
        {pw && caps && focus && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-amber-300"
          >
            <ArrowBigUp size={13} /> Caps Lock está ativado.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-rose-400"
          >
            <AlertCircle size={13} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
