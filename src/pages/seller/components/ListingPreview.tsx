import GameArt from '../../../components/store/GameArt'
import { brl } from '../../../lib/format'
import type { GameSlug } from '../../../lib/types'

interface Props {
  game: GameSlug
  emoji: string
  art: number
  title: string
  price: string
  onCycleArt: () => void
}

export function ListingPreview({ game, emoji, art, title, price, onCycleArt }: Props) {
  return (
    <div className="rounded-3xl border border-edge/50 bg-card/60 p-5">
      <p className="mb-2 text-xs font-semibold text-cream/90">Prévia do anúncio</p>
      <div className="overflow-hidden rounded-2xl border border-edge/50">
        <GameArt game={game} emoji={emoji || '🎁'} variant={art} className="aspect-[4/3] w-full" emojiSize={64} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="line-clamp-1 max-w-[68%] text-[13px] font-bold text-white">
          {title || 'Título do anúncio'}
        </p>
        <span className="font-display text-lg font-extrabold text-tang">
          {price ? brl(Number(price)) : 'R$ 0,00'}
        </span>
      </div>
      <button
        type="button"
        onClick={onCycleArt}
        className="mt-2.5 w-full rounded-xl border border-edge/60 py-2 text-[12px] font-bold text-sand transition-colors hover:border-tang hover:text-gold"
      >
        🎨 Variar estilo da arte
      </button>
    </div>
  )
}