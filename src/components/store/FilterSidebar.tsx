import { memo } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Star, Zap } from 'lucide-react'
import { CATEGORIES, GAMES } from '../../data/catalog'
import type { GameSlug } from '../../lib/types'

export interface FiltersState {
  game: GameSlug | 'all'
  category: string | 'all'
  min?: number
  max?: number
  minRating: number
  auto: boolean
  onlyAvailable: boolean
}

interface FilterSidebarProps {
  value: FiltersState
  onChange: (patch: Partial<FiltersState>) => void
  onReset: () => void
  totalResults: number
  className?: string
}

const QUICK_RANGES = [
  { label: 'Até R$ 50', min: undefined, max: 50 },
  { label: 'R$ 50 – 100', min: 50, max: 100 },
  { label: 'R$ 100 – 300', min: 100, max: 300 },
  { label: 'Acima de R$ 300', min: 300, max: undefined },
]

function FilterSidebar({ value, onChange, onReset, totalResults, className = '' }: FilterSidebarProps) {
  const radio = 'h-4 w-4 accent-[#ff9500]'
  const sectionTitle = 'font-display text-[12px] font-extrabold uppercase tracking-[0.12em] text-white'

  return (
    <aside className={`flex flex-col gap-5 rounded-2xl border border-edge/50 bg-card/60 p-4 ${className}`}>
      {/* Jogo */}
      <div>
        <h3 className={sectionTitle}>Jogo</h3>
        <div className="mt-2.5 space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-sand transition-colors hover:text-gold">
            <input type="radio" className={radio} checked={value.game === 'all'} onChange={() => onChange({ game: 'all' })} />
            Todos os jogos
          </label>
          {GAMES.map((g) => (
            <label key={g.slug} className="flex cursor-pointer items-center gap-2 text-[13px] text-sand transition-colors hover:text-gold">
              <input type="radio" className={radio} checked={value.game === g.slug} onChange={() => onChange({ game: g.slug })} />
              <span>{g.emoji}</span> {g.name}
            </label>
          ))}
        </div>
      </div>

      {/* Categoria */}
      <div className="border-t border-edge/40 pt-4">
        <h3 className={sectionTitle}>Categoria do produto</h3>
        <div className="mt-2.5 space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-sand transition-colors hover:text-gold">
            <input type="radio" className={radio} checked={value.category === 'all'} onChange={() => onChange({ category: 'all' })} />
            Todas
          </label>
          {CATEGORIES.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-[13px] text-sand transition-colors hover:text-gold">
              <input type="radio" className={radio} checked={value.category === c} onChange={() => onChange({ category: c })} />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div className="border-t border-edge/40 pt-4">
        <h3 className={sectionTitle}>Faixa de preço</h3>
        <div className="mt-2.5 flex gap-2">
          <label className="flex-1">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-sand/60">Mín</span>
            <input
              type="number"
              min={0}
              value={value.min ?? ''}
              onChange={(e) => onChange({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
              placeholder="0"
              className="h-9 w-full rounded-lg border border-edge/60 bg-[#1b120d] px-2 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-sand/60">Máx</span>
            <input
              type="number"
              min={0}
              value={value.max ?? ''}
              onChange={(e) => onChange({ max: e.target.value === '' ? undefined : Number(e.target.value) })}
              placeholder="∞"
              className="h-9 w-full rounded-lg border border-edge/60 bg-[#1b120d] px-2 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang"
            />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_RANGES.map((r) => {
            const active = value.min === r.min && value.max === r.max
            return (
              <button
                key={r.label}
                onClick={() => {
                  if (active) onChange({ min: undefined, max: undefined })
                  else onChange({ min: r.min, max: r.max })
                }}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? 'border-tang bg-tang/15 text-tang'
                    : 'border-edge/60 text-sand hover:border-tang/50 hover:text-gold'
                }`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Avaliação mínima */}
      <div className="border-t border-edge/40 pt-4">
        <h3 className={sectionTitle}>Avaliação do vendedor</h3>
        <div className="mt-2.5 space-y-1.5">
          {[
            { v: 0, label: 'Qualquer avaliação' },
            { v: 4.5, label: '4,5 ou mais' },
            { v: 4.0, label: '4,0 ou mais' },
            { v: 3.0, label: '3,0 ou mais' },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2 text-[13px] text-sand transition-colors hover:text-gold">
              <input type="radio" className={radio} checked={value.minRating === o.v} onChange={() => onChange({ minRating: o.v })} />
              {o.v > 0 && <Star size={12} className="fill-gold text-gold" />} {o.label}
            </label>
          ))}
        </div>
      </div>

      {/* Chaves */}
      <div className="space-y-2.5 border-t border-edge/40 pt-4">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-edge/50 bg-[#1b120d] px-3 py-2.5 transition-colors hover:border-tang/50">
          <span className="flex items-center gap-2 text-[13px] font-medium text-cream">
            <Zap size={14} className="text-emerald-400" /> Entrega automática
          </span>
          <input
            type="checkbox"
            checked={value.auto}
            onChange={(e) => onChange({ auto: e.target.checked })}
            className="h-4 w-4 accent-[#ff9500]"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-edge/50 bg-[#1b120d] px-3 py-2.5 transition-colors hover:border-tang/50">
          <span className="flex items-center gap-2 text-[13px] font-medium text-cream">
            <span className="text-base">✅</span> Só produtos disponíveis
          </span>
          <input
            type="checkbox"
            checked={value.onlyAvailable}
            onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
            className="h-4 w-4 accent-[#ff9500]"
          />
        </label>
      </div>

      {/* Resumo + limpar */}
      <div className="border-t border-edge/40 pt-4">
        <p className="text-xs text-sand/70">
          <span className="font-display text-sm font-extrabold text-tang">{totalResults}</span> anúncios encontrados
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-edge/60 py-2 text-[12px] font-bold tracking-wide text-sand transition-colors hover:border-red-400/50 hover:text-red-300"
        >
          <RotateCcw size={13} /> LIMPAR FILTROS
        </motion.button>
      </div>
    </aside>
  )
}

export default memo(FilterSidebar)