import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react'
import Monkey from '../Monkey'

interface Slide {
  id: number
  badge: string
  titleA: string
  titleB: string
  subtitle: string
  ctaPrimary: { label: string; to: string }
  ctaSecondary: { label: string; to: string }
  gradient: string
  glow: string
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: '🍌 Marketplace gamer',
    titleA: 'SEU UNIVERSO GAMER',
    titleB: 'COMEÇA AQUI!',
    subtitle: 'Encontre contas, itens, moedas e muito mais com ofertas incríveis.',
    ctaPrimary: { label: 'EXPLORAR OFERTAS', to: '/loja/catalogo' },
    ctaSecondary: { label: 'COMEÇAR A VENDER', to: '/loja/vender' },
    gradient: 'linear-gradient(115deg, #2a1505 0%, #70340a 42%, #c24c00 78%, #ff7900 100%)',
    glow: 'rgba(255,149,0,0.55)',
  },
  {
    id: 2,
    badge: '💎 Itens raros em oferta',
    titleA: 'FRUTAS MÍTICAS E',
    titleB: 'CONTAS RARAS',
    subtitle: 'Ofertas selecionadas de Roblox e Blox Fruits para você evoluir no jogo.',
    ctaPrimary: { label: 'VER OFERTAS DE ROBLOX', to: '/loja/categoria/roblox' },
    ctaSecondary: { label: 'VER CATÁLOGO', to: '/loja/catalogo' },
    gradient: 'linear-gradient(115deg, #170d26 0%, #42206b 45%, #8a2f8e 80%, #ff9500 100%)',
    glow: 'rgba(196,84,255,0.5)',
  },
  {
    id: 3,
    badge: '⚡ Seja um vendedor',
    titleA: 'VENDA NA',
    titleB: 'MONKEY LARANJA',
    subtitle: 'Anuncie em minutos e acompanhe suas vendas em um só lugar.',
    ctaPrimary: { label: 'VENDER AGORA', to: '/loja/vender' },
    ctaSecondary: { label: 'COMO FUNCIONA', to: '/loja/conta/suporte' },
    gradient: 'linear-gradient(115deg, #1a1205 0%, #5c4308 45%, #b8860b 80%, #ffd43b 100%)',
    glow: 'rgba(255,212,59,0.5)',
  },
]

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 92 + 2,
  top: (i * 23 + 7) % 80 + 4,
  size: 3 + (i % 3) * 2,
  delay: (i % 6) * 0.7,
  dur: 4.5 + (i % 4) * 1.4,
}))

export default function HeroBanner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | null>(null)

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    timer.current = window.setInterval(next, 6500)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [next, paused])

  const slide = SLIDES[index]

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-edge/50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Banner promocional"
    >
      {/* Fundo do slide */}
      <div className="relative h-[420px] sm:h-[460px] lg:h-[500px]" style={{ background: slide.gradient }}>
        {/* Grelha }}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(circle at 30% 40%, black, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at 30% 40%, black, transparent 85%)',
          }}
        />
        {/* Brilhos */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full"
          style={{ background: `radial-gradient(circle, ${slide.glow} 0%, transparent 64%)` }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.5), transparent 65%)' }}
        />
        {/* Anel decorativo girando */}
        <div
          className="animate-spin-slow pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-2 border-dashed border-white/15"
          style={{ animationDuration: '30s' }}
        />
        <div
          className="animate-spin-slow pointer-events-none absolute -right-6 top-10 h-36 w-36 rounded-full border border-white/10"
          style={{ animationDuration: '24s' }}
        />

        {/* Partículas/estrelas */}
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="animate-float-slow pointer-events-none absolute rounded-full bg-gold/80"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
          />
        ))}
        <span className="animate-float-slow pointer-events-none absolute bottom-16 left-[16%] text-2xl drop-shadow" style={{ animationDelay: '1s' }}>
          ⭐
        </span>
        <span className="animate-float-slow pointer-events-none absolute right-[38%] top-[18%] text-xl drop-shadow" style={{ animationDelay: '2.2s' }}>
          🍌
        </span>
        <span className="animate-float-slow pointer-events-none absolute bottom-[22%] right-[24%] text-2xl drop-shadow" style={{ animationDelay: '0.4s' }}>
          🪙
        </span>

        {/* Conteúdo */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8">
          <div className="max-w-[560px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cream backdrop-blur">
                  <Sparkles size={12} className="text-gold" /> {slide.badge}
                </span>
                <h1 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[58px]">
                  {slide.titleA}
                  <br />
                  <span className="text-gradient-gold">{slide.titleB}</span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/85 sm:text-base">
                  {slide.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={slide.ctaPrimary.to}
                    className="grad-btn group flex items-center gap-2 rounded-2xl px-6 py-3.5 font-display text-sm font-extrabold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(255,121,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                  >
                    {slide.ctaPrimary.label}
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to={slide.ctaSecondary.to}
                    className="flex items-center gap-2 rounded-2xl border-2 border-white/25 bg-black/25 px-6 py-3.5 font-display text-sm font-bold tracking-wide text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/70 hover:text-gold"
                  >
                    {slide.ctaSecondary.label}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mascote */}
        <div className="pointer-events-none absolute -bottom-4 right-4 z-10 hidden w-44 select-none sm:block sm:w-56 lg:right-16 lg:w-72">
          <div className="animate-float-slow">
            <Monkey mood="welcome" />
          </div>
        </div>

        {/* Setas */}
        <button
          onClick={prev}
          aria-label="Banner anterior"
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition hover:bg-black/55 hover:text-gold"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          aria-label="Próximo banner"
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition hover:bg-black/55 hover:text-gold"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir para o banner ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-gold' : 'w-2 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Selo de entrega automática flutuante */}
        <div className="animate-float-slow absolute bottom-6 right-[13%] z-10 hidden items-center gap-1.5 rounded-xl border border-white/15 bg-black/40 px-3 py-2 backdrop-blur lg:flex" style={{ animationDelay: '1.4s' }}>
          <Zap size={14} className="fill-gold text-gold" />
          <span className="text-[11px] font-bold text-white">Entrega automática</span>
        </div>
      </div>
    </section>
  )
}