import { useId } from 'react';

/** Marca compacta (hexagono neon) usada na navbar, hero e rodape. */
export default function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  const id = `bm-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-[0_0_10px_rgba(139,92,246,.7)]`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c084fc" />
          <stop offset=".5" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d="M32 5 55 18.5v27L32 59 9 45.5v-27z" fill="#0b0720" stroke={`url(#${id})`} strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M9 18.5 32 32l23-13.5M32 32v27" fill="none" stroke={`url(#${id})`} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4.5" fill="#fff" />
    </svg>
  );
}
