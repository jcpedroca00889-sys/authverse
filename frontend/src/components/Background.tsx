import { useEffect, useMemo, useRef } from 'react';
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePrefs } from '../hooks/usePrefs';

const shapes = [
  { k: 'cube', x: '7%', y: '16%', s: 70, d: 40, c: 'border-violet-400/70 bg-violet-500/10 shadow-[0_0_30px_rgba(139,92,246,.55)]' },
  { k: 'ring', x: '85%', y: '12%', s: 100, d: 60, c: 'border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,.5)]' },
  { k: 'orb', x: '11%', y: '72%', s: 58, d: 80, c: 'from-cyan-300 to-blue-600' },
  { k: 'cube', x: '88%', y: '66%', s: 54, d: 50, c: 'border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,.5)]' },
  { k: 'ring', x: '30%', y: '88%', s: 66, d: 30, c: 'border-fuchsia-400/60 shadow-[0_0_30px_rgba(217,70,239,.5)]' },
  { k: 'orb', x: '72%', y: '86%', s: 38, d: 70, c: 'from-fuchsia-400 to-violet-700' },
  { k: 'orb', x: '58%', y: '6%', s: 32, d: 45, c: 'from-violet-300 to-indigo-600' },
  { k: 'cube', x: '3%', y: '44%', s: 40, d: 55, c: 'border-blue-400/70 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,.5)]' },
  { k: 'ring', x: '64%', y: '42%', s: 26, d: 24, c: 'border-blue-300/50 shadow-[0_0_24px_rgba(96,165,250,.45)]' },
  { k: 'orb', x: '40%', y: '20%', s: 22, d: 32, c: 'from-cyan-200 to-violet-500' },
] as const;

function Shape({ s, i, mx, my, still }: { s: (typeof shapes)[number]; i: number; mx: MotionValue<number>; my: MotionValue<number>; still: boolean }) {
  const x = useTransform(mx, [-0.5, 0.5], [-s.d, s.d]);
  const y = useTransform(my, [-0.5, 0.5], [-s.d, s.d]);
  const look =
    s.k === 'orb' ? `rounded-full bg-gradient-to-br shadow-[0_0_34px_rgba(99,102,241,.7)] ${s.c}`
    : s.k === 'ring' ? `rounded-full border-4 ${s.c}`
    : `rounded-2xl border-[3px] ${s.c}`;
  return (
    <motion.div className="absolute" style={{ left: s.x, top: s.y, x, y }}>
      <motion.div
        className={look}
        style={{ width: s.s, height: s.s, transformPerspective: 600 }}
        animate={still ? undefined : {
          y: [0, -28, 0],
          ...(s.k !== 'orb' && { rotateX: [0, 360], rotateY: [0, 360] }),
        }}
        transition={still ? undefined : {
          y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { duration: 16 + i * 2, repeat: Infinity, ease: 'linear' },
          rotateY: { duration: 22 + i * 2, repeat: Infinity, ease: 'linear' },
        }}
      />
    </motion.div>
  );
}

export default function Background() {
  const { quality, reduce, hyper } = usePrefs();
  const canvas = useRef<HTMLCanvasElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 50, damping: 20 }), py = useSpring(my, { stiffness: 50, damping: 20 });
  const lxRaw = useMotionValue(-600), lyRaw = useMotionValue(-600);
  const lx = useSpring(lxRaw, { stiffness: 120, damping: 20 }), ly = useSpring(lyRaw, { stiffness: 120, damping: 20 });

  // parallax por camada
  const b1x = useTransform(px, [-0.5, 0.5], [34, -34]);
  const b1y = useTransform(py, [-0.5, 0.5], [22, -22]);
  const b2x = useTransform(px, [-0.5, 0.5], [-42, 42]);
  const b2y = useTransform(py, [-0.5, 0.5], [-26, 26]);
  const b3x = useTransform(px, [-0.5, 0.5], [18, -18]);
  const b3y = useTransform(py, [-0.5, 0.5], [-14, 14]);
  const starX = useTransform(px, [-0.5, 0.5], [12, -12]);
  const starY = useTransform(py, [-0.5, 0.5], [8, -8]);

  const stars = useMemo(() => {
    const count = quality === 'low' ? 44 : 88;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 1.7 + 0.6,
      d: Math.random() * 6 + 3,
      delay: -Math.random() * 8,
      o: Math.random() * 0.5 + 0.2,
    }));
  }, [quality]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const palette = hyper
      ? ['244,114,182', '168,85,247', '34,211,238']
      : ['168,85,247', '96,165,250', '34,211,238'];
    const maxP = quality === 'low' ? 42 : 92;

    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string };
    type S = { x: number; y: number; vx: number; vy: number; life: number; r: number; c: string };
    type R = { x: number; y: number; r: number; life: number; c: string };
    let ps: P[] = [];
    const sparks: S[] = [];
    const rings: R[] = [];
    const m = { x: -9999, y: -9999 };

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: Math.min(maxP, Math.floor(w / 16)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.8 + 0.7,
        c: palette[Math.floor(Math.random() * 3)],
      }));
    };

    const burst = (x: number, y: number) => {
      const n = quality === 'low' ? 8 : 16;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * 2.6 + 0.8;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, r: Math.random() * 2 + 1, c: palette[i % palette.length] });
      }
      rings.push({ x, y, r: 4, life: 1, c: '34,211,238' });
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of ps) {
        const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 0) { p.vx += (dx / d) * 0.06; p.vy += (dy / d) * 0.06; }
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 1.3) { p.vx *= 0.94; p.vy *= 0.94; }
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        ctx.fillStyle = `rgba(${p.c},.9)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 120) * 0.35})`;
            ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
          }
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy *= 0.96; s.life -= 0.018;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${s.c},${s.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, 7); ctx.fill();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.r += 2.4; r.life -= 0.02;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(${r.c},${r.life * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.stroke();
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const move = (e: PointerEvent) => {
      m.x = e.clientX; m.y = e.clientY;
      if (reduce) return;
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
      lxRaw.set(e.clientX - 210);
      lyRaw.set(e.clientY - 210);
    };
    const down = (e: PointerEvent) => { if (!reduce) burst(e.clientX, e.clientY); };

    resize();
    frame();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
    };
  }, [mx, my, lxRaw, lyRaw, quality, reduce, hyper]);

  const visibleShapes = quality === 'low' ? shapes.slice(0, 6) : shapes;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,#1a0b3d,#05030f_60%)]">
      {/* aurora reativa ao mouse */}
      <motion.div className="absolute" style={{ left: '-8%', top: '-10%', x: b1x, y: b1y }}>
        <div className="blob" style={{ width: 520, height: 520, background: '#7c3aed' }} />
      </motion.div>
      <motion.div className="absolute" style={{ right: '-6%', top: '30%', x: b2x, y: b2y }}>
        <div className="blob" style={{ width: 460, height: 460, background: '#2563eb', animationDelay: '-6s' }} />
      </motion.div>
      <motion.div className="absolute" style={{ left: '30%', bottom: '-14%', x: b3x, y: b3y }}>
        <div className="blob" style={{ width: 400, height: 400, background: '#06b6d4', animationDelay: '-12s' }} />
      </motion.div>

      {/* piso em perspectiva + horizonte */}
      <div className="horizon" />
      <div className="grid-3d" />

      {/* estrelas em camada com parallax */}
      <motion.div className="absolute inset-0" style={{ x: starX, y: starY }}>
        {stars.map((s) => (
          <span
            key={s.id}
            className="star"
            style={{
              left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s,
              opacity: s.o, animationDuration: `${s.d}s`, animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </motion.div>

      {/* estrelas cadentes */}
      {[8, 22, 36, 52, 66, 82].map((l, i) => (
        <span key={l} className="streak" style={{ left: `${l + 20}%`, top: `${-4 + (i % 3) * 8}%`, animationDelay: `${i * 1.7}s`, animationDuration: `${5 + (i % 3)}s` }} />
      ))}

      {/* rede de particulas + burst de clique */}
      <canvas ref={canvas} className="absolute inset-0" />

      {visibleShapes.map((s, i) => <Shape key={i} s={s} i={i} mx={px} my={py} still={reduce} />)}

      {/* halo que segue o cursor */}
      <motion.div
        className="fixed left-0 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.28),transparent_62%)]"
        style={{ x: lx, y: ly, opacity: reduce ? 0.6 : 1 }}
      />

      {/* textura */}
      <div className="scanlines" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
}
