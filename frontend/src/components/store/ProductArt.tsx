import { useId } from 'react';
import type { Accent, Glyph } from '../../services/store';

export const ACCENTS: Record<Accent, { a: string; b: string; glow: string }> = {
  violet: { a: '#7c3aed', b: '#c084fc', glow: 'rgba(139,92,246,.55)' },
  cyan: { a: '#0891b2', b: '#67e8f9', glow: 'rgba(34,211,238,.5)' },
  blue: { a: '#1d4ed8', b: '#93c5fd', glow: 'rgba(59,130,246,.5)' },
  fuchsia: { a: '#a21caf', b: '#f0abfc', glow: 'rgba(217,70,239,.5)' },
  emerald: { a: '#047857', b: '#6ee7b7', glow: 'rgba(16,185,129,.45)' },
  amber: { a: '#b45309', b: '#fcd34d', glow: 'rgba(245,158,11,.45)' },
};

function GlyphShape({ glyph, id }: { glyph: Glyph; id: string }) {
  const line = {
    stroke: `url(#${id})`,
    strokeWidth: 3,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const paint = `url(#${id})`;

  switch (glyph) {
    case 'cube':
      return (
        <g {...line}>
          <path d="M60 16 98 38v44L60 104 22 82V38z" />
          <path d="M22 38l38 22 38-22M60 60v44" />
          <circle cx="60" cy="60" r="5" fill={paint} stroke="none" />
        </g>
      );
    case 'ring':
      return (
        <g {...line}>
          <circle cx="60" cy="60" r="36" />
          <circle cx="60" cy="60" r="23" opacity=".7" />
          <circle cx="60" cy="60" r="7" fill={paint} stroke="none" />
        </g>
      );
    case 'orb':
      return (
        <g>
          <circle cx="60" cy="60" r="34" fill={paint} opacity=".22" />
          <circle cx="60" cy="60" r="34" {...line} />
          <ellipse cx="60" cy="60" rx="34" ry="12" {...line} opacity=".65" />
          <ellipse cx="60" cy="60" rx="12" ry="34" {...line} opacity=".4" />
          <circle cx="50" cy="48" r="4" fill="#fff" opacity=".9" />
        </g>
      );
    case 'grid':
      return (
        <g {...line}>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={29 + c * 22}
                y={29 + r * 22}
                width="16"
                height="16"
                rx="4"
                opacity={r === 1 && c === 1 ? 1 : 0.5}
              />
            )),
          )}
        </g>
      );
    case 'wave':
      return (
        <g {...line}>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M18 ${40 + i * 14} q11 -13 22 0 t22 0 t22 0 t22 0`}
              opacity={1 - i * 0.2}
            />
          ))}
        </g>
      );
    case 'prism':
      return (
        <g {...line}>
          <path d="M60 18 102 92H18z" />
          <path d="M60 18v74M18 92l42-38 42 38" opacity=".6" />
        </g>
      );
    case 'bolt':
      return (
        <g>
          <path
            d="M70 14 34 66h23l-7 40 37-54H63z"
            fill={paint}
            opacity=".85"
            stroke={paint}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      );
    case 'layers':
      return (
        <g {...line}>
          <path d="M60 20 100 41 60 62 20 41z" />
          <path d="M20 60l40 21 40-21" opacity=".75" />
          <path d="M20 79l40 21 40-21" opacity=".5" />
        </g>
      );
  }
}

/** Capa gerada (sem imagens): grade neon + emblema geometrico do produto. */
export default function ProductArt({
  glyph,
  accent,
  className = '',
}: {
  glyph: Glyph;
  accent: Accent;
  className?: string;
}) {
  const id = `pa-${useId().replace(/:/g, '')}`;
  const a = ACCENTS[accent] ?? ACCENTS.violet;
  const mask = 'radial-gradient(ellipse at center, #000 10%, transparent 78%)';

  return (
    <div className={`relative isolate overflow-hidden bg-[#080514] ${className}`}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 0%, ${a.a}44, transparent 62%)` }}
      />
      <div
        className="absolute inset-0 opacity-[.20]"
        style={{
          backgroundImage: `linear-gradient(${a.b} 1px, transparent 1px), linear-gradient(90deg, ${a.b} 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      <div
        className="absolute -left-1/4 top-0 h-2/3 w-2/3 rounded-full opacity-40 blur-3xl"
        style={{ background: a.a }}
      />
      <div
        className="absolute -bottom-10 right-0 h-1/2 w-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: a.b }}
      />
      <svg
        viewBox="0 0 120 120"
        className="art-zoom relative h-full w-full p-5 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-3"
        style={{ filter: `drop-shadow(0 0 16px ${a.glow})` }}
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a.b} />
            <stop offset="1" stopColor={a.a} />
          </linearGradient>
        </defs>
        <GlyphShape glyph={glyph} id={id} />
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,3,15,.85),transparent_58%)]" />
    </div>
  );
}
