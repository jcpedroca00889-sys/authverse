import { PointerEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Props { children: ReactNode; loading?: boolean; type?: 'button' | 'submit'; onClick?: () => void }

export default function MagneticButton({ children, loading, type = 'button', onClick }: Props) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14 }), sy = useSpring(y, { stiffness: 220, damping: 14 });
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.22); y.set((e.clientY - r.top - r.height / 2) * 0.4);
  };
  return (
    <motion.button type={type} onClick={onClick} disabled={loading} className="btn-neon" style={{ x: sx, y: sy }}
      onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.94 }}>
      {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Autenticando…</> : children}
    </motion.button>
  );
}
