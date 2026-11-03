import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import Avatar from '../../components/store/Avatar'
import StarRating from '../../components/store/StarRating'
import { prettyDate } from '../../lib/format'
import type { Product } from '../../lib/types'

interface Props {
  product: Product
  reviewText: string
  reviewRating: number
  onReviewTextChange: (v: string) => void
  onReviewRatingChange: (v: number) => void
  onSubmitReview: (e: React.FormEvent) => void
}

function Star({ filled }: { filled: boolean }) {
  return <span className={filled ? 'text-gold' : 'text-edge'} aria-hidden>★</span>
}

export function ProductReviews({ product, reviewText, reviewRating, onReviewTextChange, onReviewRatingChange, onSubmitReview }: Props) {
  return (
    <div className="rounded-3xl border border-edge/50 bg-card/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold text-white">Avaliações dos compradores</h2>
        <div className="flex items-center gap-2">
          <span className="font-display text-3xl font-extrabold text-gold">{product.rating.toFixed(1)}</span>
          <div>
            <StarRating rating={product.rating} size={13} showValue={false} />
            <p className="text-[11px] text-sand/70">{product.ratingCount} avaliações</p>
          </div>
        </div>
      </div>

      {/* Formulário de avaliação */}
      <form onSubmit={onSubmitReview} className="mt-4 rounded-2xl border border-edge/40 bg-[#1b120d]/70 p-4">
        <p className="mb-2 text-[13px] font-semibold text-cream">Deixe sua avaliação</p>
        <div className="mb-2.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => onReviewRatingChange(s)}
              className="text-xl transition-transform hover:scale-110" aria-label={`${s} estrelas`}>
              <Star filled={s <= reviewRating} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={reviewText} onChange={(e) => onReviewTextChange(e.target.value)}
            placeholder="Conte como foi sua experiência com este produto..."
            className="h-10 flex-1 rounded-xl border border-edge/60 bg-[#17100c] px-3.5 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang" />
          <motion.button whileTap={{ scale: 0.94 }} type="submit"
            className="grad-btn flex h-10 w-10 items-center justify-center rounded-xl text-white" aria-label="Enviar avaliação">
            <Send size={16} />
          </motion.button>
        </div>
      </form>

      <div className="mt-5 space-y-4">
        {product.reviews.map((r) => (
          <div key={r.id} className="border-t border-edge/30 pt-4 first:border-0 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[13px] font-bold text-white">
                <Avatar name={r.author} size={24} /> {r.author}
              </span>
              <span className="text-[11px] text-sand/60">{prettyDate(r.date)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <StarRating rating={r.rating} size={12} showValue={false} />
              <span className="font-display text-xs font-bold text-gold">{r.rating.toFixed(1)}</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-sand">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}