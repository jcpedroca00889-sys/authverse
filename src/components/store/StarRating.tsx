import { memo } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  count?: number
  size?: number
  showValue?: boolean
  className?: string
}

/** Avaliação com estrelas (cheias conforme arredondamento) + contador opcional. */
function StarRating({ rating, count, size = 14, showValue = true, className = '' }: StarRatingProps) {
  const filled = Math.round(rating)
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-[1px]" aria-label={`Avaliação ${rating} de 5`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={size}
            className={s <= filled ? 'fill-gold text-gold' : 'fill-transparent text-edge'}
            strokeWidth={1.6}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-gold">{rating.toFixed(1)}</span>
      )}
      {typeof count === 'number' && count > 0 && (
        <span className="text-xs text-sand/80">({count})</span>
      )}
    </div>
  )
}

export default memo(StarRating)