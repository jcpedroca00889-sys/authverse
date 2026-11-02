import { PointerEvent, ReactNode, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePrefs } from '../hooks/usePrefs';

interface Props {
  children: ReactNode;
  className?: string;
  /** desliga o tilt 3D (ex.: em telas pequenas) */
  flat?: boolean;
}

/** Cartao de vidro com tilt 3D, brilho holografico, spotlight e faiscas na borda. */
export default function HoloCard({ children, className = '', flat = false }: Props) {
  const { reduce } = usePrefs();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const tilt = !flat && !reduce;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
    if (tilt) { ry.set((px - 0.5) * 10); rx.set(-(py - 0.5) * 10); }
  };

  const leave = () => {
    rx.set(0); ry.set(0);
    ref.current?.style.setProperty('--gx', '50%');
    ref.current?.style.setProperty('--gy', '50%');
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      style={tilt ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined}
      className={`glass glow-border relative ${className}`}
    >
      <span aria-hidden className="orbit">
        <span className="spark" />
        <span className="spark spark-2" />
      </span>
      <span aria-hidden className="holo-spot pointer-events-none absolute inset-0 rounded-[inherit]" />
      <span aria-hidden className="holo-glare pointer-events-none absolute inset-0 rounded-[inherit]" />
      <motion.span
        aria-hidden
        initial={{ top: '-4%', opacity: 0 }}
        animate={{ top: '104%', opacity: [0, 0.85, 0] }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
        className="card-scan"
      />
      <div className="relative z-10" style={tilt ? { transform: 'translateZ(34px)' } : undefined}>
        {children}
      </div>
    </motion.div>
  );
}
