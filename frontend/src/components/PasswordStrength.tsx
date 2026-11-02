import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { strength } from '../services/validation';

const labels = ['', 'Fraca', 'Razoável', 'Forte', 'Épica'];
const tones = ['#64748b', '#f43f5e', '#fbbf24', '#22d3ee', '#34d399'];
const COLORS = ['#a855f7', '#60a5fa', '#22d3ee', '#f0abfc', '#34d399'];

const R = 17;
const CIRC = 2 * Math.PI * R;

function Burst() {
  const bits = useMemo(
    () => Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 26 + Math.random() * 34;
      return { id: i, x: Math.cos(a) * dist, y: Math.sin(a) * dist, s: Math.random() * 4 + 2, c: COLORS[i % COLORS.length] };
    }),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute left-[22px] top-[22px] z-10">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full"
          style={{ height: b.s, width: b.s, background: b.c, boxShadow: `0 0 10px ${b.c}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: b.x, y: b.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/** Medidor radial de força com requisitos e confete no nivel maximo. */
export default function PasswordStrength({ value }: { value: string }) {
  const s = strength(value);
  const prev = useRef(s);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (s === 4 && prev.current < 4) setBurst((b) => b + 1);
    prev.current = s;
  }, [s]);

  if (!value) return null;

  const reqs = [
    { ok: value.length >= 8, t: '8+' },
    { ok: /[a-z]/.test(value) && /[A-Z]/.test(value), t: 'Aa' },
    { ok: /\d/.test(value), t: '0-9' },
    { ok: /[^A-Za-z0-9]/.test(value), t: 'Símbolo' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="relative mt-2.5"
    >
      {burst > 0 && <Burst key={burst} />}
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0">
          <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
            <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="4" />
            <motion.circle
              cx="22" cy="22" r={R} fill="none"
              stroke={tones[s]} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={false}
              animate={{ strokeDashoffset: CIRC * (1 - s / 4) }}
              transition={{ type: 'spring', stiffness: 90, damping: 16 }}
              style={{ filter: `drop-shadow(0 0 6px ${tones[s]}88)` }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold" style={{ color: tones[s] }}>
            {s}/4
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-slate-400">Força da senha</span>
            <span className="text-xs font-semibold" style={{ color: tones[s] }}>{labels[s]}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {reqs.map((r) => (
              <span
                key={r.t}
                className={`rounded-full border px-1.5 py-px text-[9px] font-medium transition-colors ${
                  r.ok ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-white/10 bg-white/[0.03] text-slate-500'
                }`}
              >
                {r.t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
