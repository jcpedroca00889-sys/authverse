import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, ChevronRight, Flag, Minus, Plus, ShieldCheck, ShoppingCart, Timer, Zap } from 'lucide-react'
import Avatar from '../../components/store/Avatar'
import StarRating from '../../components/store/StarRating'
import { brl, shortDate } from '../../lib/format'
import type { GameInfo, Product, SellerInfo } from '../../lib/types'

interface Props {
  product: Product
  game: GameInfo | null
  seller: SellerInfo | null
  discount: number
  fav: boolean
  qty: number
  onQtyChange: (q: number) => void
  onBuyNow: () => void
  onAddToCart: () => void
  onToggleFav: () => void
  onReport: () => void
}

export function ProductBuyColumn({ product, game, seller, discount, fav, qty, onQtyChange, onBuyNow, onAddToCart, onToggleFav, onReport }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Card principal */}
      <div className="rounded-3xl border border-edge/50 bg-card/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sand/70">
              <span className="text-tang">{game?.short}</span>
              <span className="text-edge">•</span>
              <span>{product.category}</span>
            </div>
            <h1 className="font-display mt-1.5 text-xl font-extrabold leading-tight text-white sm:text-2xl">
              {product.title}
            </h1>
          </div>
          <motion.button
            onClick={onToggleFav}
            whileTap={{ scale: 0.8 }}
            aria-label="Favoritar"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              fav ? 'border-gold/70 bg-gold/15 text-gold' : 'border-edge/60 text-sand hover:text-gold'
            }`}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" className={fav ? 'fill-gold' : 'fill-none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </motion.button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <StarRating rating={product.rating} count={product.ratingCount} size={15} />
          <span className="text-xs text-sand/70">+{product.salesCount} vendidos</span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
              product.status === 'available'
                ? 'bg-emerald-500/15 text-emerald-300'
                : product.status === 'low'
                  ? 'bg-gold/15 text-gold'
                  : 'bg-red-500/15 text-red-300'
            }`}
          >
            {product.status === 'available' ? 'Disponível' : product.status === 'low' ? 'Últimas unidades' : 'Esgotado'}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2.5 rounded-2xl border border-tang/25 bg-gradient-to-r from-[#2a1608] to-[#1d130c] px-4 py-3.5">
          <span className="font-display text-[34px] font-extrabold leading-none text-tang">
            {brl(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="pb-1 text-sm text-sand/55 line-through">{brl(product.oldPrice)}</span>
          )}
          {discount >= 5 && (
            <span className="mb-1.5 ml-auto rounded-lg bg-red-500/20 px-2 py-0.5 font-display text-[13px] font-extrabold text-red-300">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quantidade */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-sand">Quantidade</span>
          <div className="flex items-center gap-1 rounded-xl border border-edge/60 bg-[#1b120d] p-1">
            <button onClick={() => onQtyChange(Math.max(1, qty - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sand transition hover:bg-white/5 hover:text-gold"
              aria-label="Diminuir quantidade">
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-display text-sm font-bold text-white">{qty}</span>
            <button onClick={() => onQtyChange(Math.min(Math.max(1, product.stock), qty + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sand transition hover:bg-white/5 hover:text-gold"
              aria-label="Aumentar quantidade">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <motion.button onClick={onBuyNow} whileTap={{ scale: 0.98 }}
            className="grad-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[15px] font-extrabold tracking-wide text-white shadow-[0_16px_36px_-12px_rgba(255,121,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110">
            <Zap size={18} strokeWidth={2.6} /> COMPRAR AGORA
          </motion.button>
          <motion.button onClick={onAddToCart} whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gold/60 py-3 font-display text-sm font-bold tracking-wide text-gold transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold/10">
            <ShoppingCart size={17} /> ADICIONAR AO CARRINHO
          </motion.button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: '🔒', label: 'Compra segura' },
            { icon: '🛡️', label: 'Garantia 7 dias' },
            { icon: '⚡', label: 'Entrega rápida' },
          ].map((b) => (
            <div key={b.label} className="rounded-xl border border-edge/40 bg-[#1b120d]/70 px-1 py-2.5">
              <span className="block text-base">{b.icon}</span>
              <span className="mt-0.5 block text-[10px] font-semibold text-sand">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vendedor */}
      <div className="rounded-3xl border border-edge/50 bg-card/60 p-5">
        <h2 className="font-display mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white">Vendedor</h2>
        <div className="flex items-center gap-3">
          <Avatar name={product.sellerUsername} size={52} />
          <div className="min-w-0">
            <Link to={`/loja/vendedor/${product.sellerUsername}`}
              className="flex items-center gap-1.5 font-display text-[15px] font-bold text-white transition-colors hover:text-gold">
              <span className="line-clamp-1">{seller?.displayName ?? product.sellerUsername}</span>
              {seller?.verified && <BadgeCheck size={15} className="shrink-0 fill-sky-500/90 text-white" />}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-sand">
              <StarRating rating={product.rating} count={product.ratingCount} size={11} showValue={false} />
              <span className="text-emerald-300">★ {product.rating}</span>
              <span>• {product.salesCount} vendas</span>
            </div>
          </div>
        </div>
        {seller && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-sand/70">
            <span className="flex items-center gap-1"><Timer size={11} /> Responde em {seller.responseTime}</span>
            <span>Na plataforma desde {shortDate(seller.memberSince)}</span>
          </div>
        )}
        <Link to={`/loja/vendedor/${product.sellerUsername}`}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-edge/60 py-2 text-[12.5px] font-bold tracking-wide text-sand transition-colors hover:border-gold/60 hover:text-gold">
          VER PERFIL DO VENDEDOR <ChevronRight size={13} />
        </Link>
      </div>

      {/* Reputação + denúncia */}
      <div className="flex items-center justify-between rounded-3xl border border-dashed border-edge/50 bg-card/30 px-5 py-3.5">
        <span className="flex items-center gap-2 text-[12px] text-sand">
          <ShieldCheck size={15} className="text-emerald-400" /> Reputação: {seller?.verified ? 'vendedor verificado' : 'anúncio em análise'}
        </span>
        <button onClick={onReport} className="flex items-center gap-1.5 text-[12px] font-semibold text-sand/70 transition-colors hover:text-red-300">
          <Flag size={13} /> Denunciar
        </button>
      </div>
    </div>
  )
}