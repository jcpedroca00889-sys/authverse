import { motion } from 'framer-motion'

// Partículas minimalistas — animação apenas com transform (GPU, sem repintura)
const DOTS = Array.from({ length: 6 }, (_, i) => ({
  left: (i * 41 + 13) % 100,
  top: (i * 29 + 17) % 100,
  size: 2.5 + (i % 3),
  delay: (i % 4) * 0.9,
  dur: 7 + (i % 3) * 2,
}))

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Glows via radial-gradient — evita filter:blur (pesado) */}
      <div
        className="absolute left-1/2 top-[-240px] h-[560px] w-[760px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,121,0,0.16), transparent 68%)' }}
      />
      <div
        className="absolute bottom-[-200px] left-[-180px] h-[440px] w-[440px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(217,75,0,0.12), transparent 70%)' }}
      />
      <div
        className="absolute right-[-180px] top-[28%] h-[400px] w-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.10), transparent 70%)' }}
      />

      {/* Partículas discretas (transform only) */}
      {DOTS.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/50 will-change-transform"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [-7, 7, -7] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}