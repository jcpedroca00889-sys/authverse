import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, Heart, ShoppingCart, Zap } from 'lucide-react'
import GameArt from './GameArt'
import StarRating from './StarRating'
import Avatar from './Avatar'
import { discountPct, gameBySlug, sellerByUsername } from '../../data/catalog'
import { brl } from '../../lib/format'
import { useCart, useFavorites, useToasts } from '../../state/StoreProviders'
import type { Product } from '../../lib/types'

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : String(n)

function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const { add } = useCart()
  const { has, toggle } = useFavorites()
  const { push } = useToasts()
  const game = gameBySlug(product.game)
  const seller = sellerByUsername(product.sellerUsername)
  const discount = discountPct(product)
  const fav = has(product.id)

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    add(product, 1)
    push('success', 'Adicionado ao carrinho! 🛒', product.title)
  }

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
    push(fav ? 'info' : 'success', fav ? 'Removido dos favoritos' : 'Salvo nos favoritos ❤️', product.title)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(delay, 0.15) }}
      whileHover={{ y: -5 }}
      className="group relative h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-edge/50 bg-card/80 transition-all duration-300 hover:border-tang/70 hover:shadow-[0_18px_46px_-16px_rgba(255,121,0,0.45),0_0_0_1px_rgba(255,149,0,0.15)]">
        {/* ── Arte do produto ── */}
        <Link to={`/loja/produto/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
          <GameArt
            game={product.game}
            emoji={product.emoji}
            variant={product.art}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.06]"
            emojiSize={54}
          />

          {/* Desconto real */}
          {!product.variants && discount >= 5 && (
            <span className="grad-btn absolute left-2.5 top-2.5 rounded-lg px-2 py-0.5 font-display text-[11px] font-extrabold text-white shadow-lg">
              -{discount}%
            </span>
          )}

          {/* Badge de variações */}
          {product.variants && product.variants.length > 0 && (
            <span className="absolute left-2.5 top-2.5 rounded-lg bg-indigo-500/85 px-2 py-0.5 font-display text-[10px] font-extrabold text-white shadow-lg backdrop-blur">
              {product.variants.length} {product.variants.length === 1 ? 'variação' : 'variações'}
            </span>
          )}

          {/* Favoritar */}
          <motion.button
            onClick={toggleFav}
            whileTap={{ scale: 0.75 }}
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition-colors ${
              fav
                ? 'border-gold/70 bg-gold/20 text-gold'
                : 'border-white/20 bg-black/35 text-white/85 hover:border-gold/60 hover:text-gold'
            }`}
          >
            <motion.span
              key={String(fav)}
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <Heart size={15} className={fav ? 'fill-gold' : ''} />
            </motion.span>
          </motion.button>

          {/* Tipo de entrega */}
          <span
            className={`absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${
              product.delivery === 'automatic'
                ? 'bg-emerald-500/85 text-white'
                : 'bg-black/50 text-cream'
            }`}
          >
            {product.delivery === 'automatic' ? (
              <>
                <Zap size={10} className="fill-white" /> Auto
              </>
            ) : (
              'Manual'
            )}
          </span>
        </Link>

        {/* ── Conteúdo ── */}
        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sand/70">
            <span className="text-tang">{game.short}</span>
            <span className="text-edge">•</span>
            <span>{product.category}</span>
          </div>

          <Link to={`/loja/produto/${product.id}`}>
            <h3 className="line-clamp-2 min-h-[2.55rem] text-[13.5px] font-semibold leading-snug text-white transition-colors group-hover:text-gold">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <StarRating rating={product.rating} count={product.ratingCount} size={12} />
            <span className="text-[10.5px] text-sand/70">
              +{compact(product.salesCount)} vendidos
            </span>
          </div>

          {/* Vendedor */}
          <Link
            to={`/loja/vendedor/${product.sellerUsername}`}
            className="mt-0.5 flex w-fit items-center gap-1.5 rounded-full transition-colors hover:text-gold"
          >
            <Avatar name={product.sellerUsername} size={18} className="ring-1" />
            <span className="max-w-[120px] truncate text-[11.5px] font-medium text-sand">
              {seller?.displayName ?? product.sellerUsername}
            </span>
            {seller?.verified && <BadgeCheck size={13} className="shrink-0 fill-sky-500/90 text-white" />}
          </Link>

          <div className="mt-auto flex items-end justify-between pt-1.5">
            <div className="leading-none">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[17px] font-extrabold text-tang">
                  {product.variants && product.variants.length > 0
                    ? `${brl(Math.min(...product.variants.map((v) => v.price)))}–${brl(Math.max(...product.variants.map((v) => v.price)))}`
                    : brl(product.price)}
                </span>
                {!product.variants && product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-[11px] text-sand/55 line-through">
                    {brl(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>
            <motion.button
              onClick={quickAdd}
              whileTap={{ scale: 0.85 }}
              aria-label="Adicionar ao carrinho"
              className="grad-btn flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-[0_8px_18px_-6px_rgba(255,121,0,0.7)] transition-all duration-200 hover:brightness-110"
            >
              <ShoppingCart size={15} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)