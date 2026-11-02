import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePrefs } from '../hooks/usePrefs';

/** Anel suave que acompanha o cursor e reage a elementos interativos. */
export default function CursorGlow() {
  const { reduce, quality } = usePrefs();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.35 });

  useEffect(() => {
    const ok = !reduce && quality === 'high' && window.matchMedia('(pointer: fine)').matches;
    setEnabled(ok);
    if (!ok) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as Element | null;
      setActive(!!el?.closest?.('button, a, input, textarea, select, label, [role="button"]'));
    };
    const leave = () => { x.set(-100); y.set(-100); setActive(false); };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
    };
  }, [reduce, quality, x, y]);

  if (!enabled) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60]" style={{ x: sx, y: sy }}>
      <motion.span
        className="-ml-4 -mt-4 block h-8 w-8 rounded-full border"
        animate={{
          scale: active ? 1.8 : 1,
          opacity: active ? 0.95 : 0.5,
          borderColor: active ? 'rgba(34,211,238,0.9)' : 'rgba(168,85,247,0.75)',
          backgroundColor: active ? 'rgba(34,211,238,0.10)' : 'rgba(168,85,247,0.04)',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      />
      <span className="absolute left-0 top-0 -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_10px_2px_rgba(34,211,238,.9)]" />
    </motion.div>
  );
}
