import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <motion.div animate={{ y: [0, -6, 0], rotate: [0, 4, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative">
        <div className="absolute inset-0 rounded-full bg-violet-500/50 blur-2xl" />
        <svg viewBox="0 0 64 64" className="relative h-16 w-16 drop-shadow-[0_0_14px_rgba(139,92,246,.9)]">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c084fc" /><stop offset=".5" stopColor="#60a5fa" /><stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path d="M32 4 56 18v28L32 60 8 46V18z" fill="#0b0720" stroke="url(#lg)" strokeWidth="4" strokeLinejoin="round" />
          <path d="M8 18l24 14 24-14M32 32v28" fill="none" stroke="url(#lg)" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="5" fill="#fff" />
        </svg>
        <motion.span className="absolute -inset-3" animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />
        </motion.span>
      </motion.div>
      <h1 className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-200 bg-clip-text text-3xl font-bold tracking-[.3em] text-transparent">AUTHVERSE</h1>
    </div>
  );
}
