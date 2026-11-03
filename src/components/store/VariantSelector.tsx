import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import type { ProductVariant } from '../../lib/types'
import { brl } from '../../lib/format'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selected: string
  onSelect: (name: string) => void
  category: string
}

/**
 * Seletor de variações (planos/pacotes/tiers) para a página do produto.
 */
export default function VariantSelector({ variants, selected, onSelect, category }: VariantSelectorProps) {
  // Determina o estilo visual baseado na categoria
  const isDuration = variants.some((v) => v.period)
  const isTier = variants.some((v) => ['Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'].includes(v.name))
  const isPack = !isDuration && !isTier

  return (
    <div className="space-y-2.5">
      <p className="text-[13px] font-semibold text-sand">
        {isDuration ? 'Plano' : isTier ? 'Categoria' : 'Pacote'}
      </p>
      <div className={`grid gap-2.5 ${variants.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {variants.map((v, i) => {
          const active = selected === v.name
          const discount = v.oldPrice && v.oldPrice > v.price
            ? Math.round(((v.oldPrice - v.price) / v.oldPrice) * 100)
            : 0

          return (
            <motion.button
              key={v.name}
              type="button"
              onClick={() => onSelect(v.name)}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-left transition-all ${
                active
                  ? 'border-tang bg-tang/8 shadow-[0_0_0_3px_rgba(255,149,0,0.12)]'
                  : 'border-edge/40 bg-[#1b120d]/70 hover:border-edge'
              }`}
            >
              {/* Badge de destaque */}
              {v.badge && (
                <span className={`absolute -top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  active ? 'grad-btn text-white' : 'bg-gold/15 text-gold'
                }`}>
                  {v.badge}
                </span>
              )}

              {/* Emoji */}
              {v.emoji && (
                <span className="text-xl leading-none">{v.emoji}</span>
              )}

              {/* Nome */}
              <span className={`font-display text-[13px] font-extrabold ${
                active ? 'text-gold' : 'text-white'
              }`}>
                {v.name}
              </span>

              {/* Subtítulo */}
              {v.subtitle && (
                <span className="text-[10px] text-sand/70 leading-tight text-center">{v.subtitle}</span>
              )}

              {/* Preço */}
              <span className="font-display text-[15px] font-extrabold text-tang">
                {brl(v.price)}
              </span>

              {/* Preço antigo e desconto */}
              {discount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-sand/50 line-through">{brl(v.oldPrice!)}</span>
                  <span className="text-[10px] font-bold text-emerald-400">-{discount}%</span>
                </div>
              )}

              {/* Período */}
              {v.period && v.period !== 'vitalicio' && (
                <span className="text-[9px] text-sand/60 uppercase tracking-wide">
                  {{
                    diario: '/dia',
                    semanal: '/semana',
                    mensal: '/mês',
                    trimestral: '/trimestre',
                    semestral: '/semestre',
                    anual: '/ano',
                  }[v.period] || ''}
                </span>
              )}

              {/* Qty range */}
              <span className="text-[9px] text-sand/50">
                {v.minQty}-{v.maxQty} un.
              </span>

              {/* Check ativo */}
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tang"
                >
                  <Check size={11} className="text-white" strokeWidth={3} />
                </motion.span>
              )}

              {/* Itens inclusos */}
              {active && v.includes && v.includes.length > 0 && (
                <div className="mt-1.5 border-t border-tang/20 pt-1.5 w-full">
                  {v.includes.map((item) => (
                    <span key={item} className="flex items-center gap-1 text-[10px] text-emerald-300">
                      <Zap size={8} className="fill-emerald-400" /> {item}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}