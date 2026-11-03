import { motion } from 'framer-motion'
import { Truck, Zap } from 'lucide-react'
import GameArt from '../../components/store/GameArt'
import type { Product } from '../../lib/types'

interface Props {
  product: Product
  galleryIdx: number
  galleryVariants: number[]
  discount: number
  onGalleryChange: (i: number) => void
}

export function ProductGallery({ product, galleryIdx, galleryVariants, discount, onGalleryChange }: Props) {
  return (
    <div>
      <motion.div
        key={galleryIdx}
        initial={{ opacity: 0.4, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-edge/50"
      >
        <GameArt
          game={product.game}
          emoji={product.emoji}
          variant={galleryVariants[galleryIdx] ?? product.art}
          className="aspect-[4/3] w-full sm:aspect-[16/10]"
          emojiSize={110}
        />
        {discount >= 5 && (
          <span className="grad-btn absolute left-4 top-4 rounded-xl px-3 py-1 font-display text-sm font-extrabold text-white shadow-lg">
            -{discount}%
          </span>
        )}
        <span
          className={`absolute bottom-4 left-4 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide backdrop-blur ${
            product.delivery === 'automatic' ? 'bg-emerald-500/90 text-white' : 'bg-black/55 text-cream'
          }`}
        >
          {product.delivery === 'automatic' ? <Zap size={13} className="fill-white" /> : <Truck size={13} />}
          {product.delivery === 'automatic' ? 'Entrega automática' : 'Entrega manual'}
        </span>
      </motion.div>

      <div className="mt-3 flex gap-3">
        {galleryVariants.map((v, i) => (
          <button
            key={v}
            onClick={() => onGalleryChange(i)}
            className={`relative h-20 w-28 overflow-hidden rounded-xl border-2 transition-all ${
              i === galleryIdx ? 'border-tang shadow-[0_0_18px_-4px_rgba(255,149,0,0.6)]' : 'border-edge/50 opacity-70 hover:opacity-100'
            }`}
            aria-label={`Imagem ${i + 1}`}
          >
            <GameArt game={product.game} emoji={product.emoji} variant={v} className="h-full w-full" emojiSize={32} />
          </button>
        ))}
      </div>
    </div>
  )
}