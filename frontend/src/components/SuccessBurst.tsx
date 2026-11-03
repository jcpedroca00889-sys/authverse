import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const COLORS = ['#a855f7', '#60a5fa', '#22d3ee', '#f0abfc', '#34d399'];

/** Overlay de sucesso: flash, check desenhado e explosao de particulas. */
export default function SuccessBurst({ show }: { show: boolean }) {
  const bits = useMemo(
    () => Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.35;
      const dist = 70 + Math.random() * 90;
      return { id: i, x: Math.cos(a) * dist, y: Math.sin(a) * dist, s: Math.random() * 5 + 3, c: COLORS[i % COLORS.length], d: Math.random() * 0.15 };
    }),
    [],
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed inset-0 z-[70] grid place-items-center"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.35),transparent_65%)]"
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.25, opacity: 0 }}
            transition={{
              scale: { type: 'spring', stiffness: 260, damping: 18 },
              opacity: { type: 'spring', stiffness: 260, damping: 18 },
              filter: { duration: 0.4, ease: 'easeOut' }, // Prevents spring overshoot into negative blur
            }}
            className="relative grid place-items-center"
          >
            <svg viewBox="0 0 88 88" className="h-24 w-24 drop-shadow-[0_0_24px_rgba(34,211,238,.8)]">
              <defs>
                <linearGradient id="ok-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#c084fc" />
                  <stop offset=".5" stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="44" cy="44" r="38" fill="none" stroke="url(#ok-g)" strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
              <motion.path
                d="M28 45.5 39.5 57 61 33"
                fill="none" stroke="#e0f2fe" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {bits.map((b) => (
              <motion.span
                key={b.id}
                className="absolute rounded-full"
                style={{ height: b.s, width: b.s, background: b.c, boxShadow: `0 0 12px ${b.c}` }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: b.x, y: b.y, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.9, delay: b.d, ease: 'easeOut' }}
              />
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.45 }}
            className="absolute mt-44 text-xs font-semibold uppercase tracking-[.35em] text-cyan-200"
          >
            Acesso concedido
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}