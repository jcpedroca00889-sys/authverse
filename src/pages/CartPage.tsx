import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import GameArt from '../components/store/GameArt'
import { EmptyState } from '../components/store/Skeletons'
import { discountPct, gameBySlug } from '../data/catalog'
import { brl } from '../lib/format'
import { useCart, useToasts } from '../state/StoreProviders'

export default function CartPage() {
  const { items, remove, setQty, subtotal, count } = useCart()
  const { push } = useToasts()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-6">
        <h1 className="font-display mb-6 text-2xl font-extrabold text-white sm:text-3xl">Meu carrinho</h1>
        <EmptyState
          icon={<ShoppingCart size={30} />}
          title="Seu carrinho está vazio"
          subtitle="Explore o catálogo e adicione contas, itens, moedas e skins que combinam com você."
          action={
            <Link to="/loja/catalogo" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              EXPLORAR OFERTAS
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-5 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Meu carrinho</h1>
        <span className="text-sm text-sand">
          {count} {count === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Itens */}
        <div className="space-y-3">
          {items.map(({ product, qty, variantName, unitPrice }, i) => {
            const game = gameBySlug(product.game)
            const discount = discountPct(product)
            const displayPrice = unitPrice ?? product.price
            return (
              <motion.div
                key={product.id + (variantName ?? '')}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3.5 rounded-2xl border border-edge/50 bg-card/60 p-3.5 transition-colors hover:border-edge"
              >
                <Link to={`/loja/produto/${product.id}`} className="group relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                  <GameArt game={product.game} emoji={product.emoji} variant={product.art} className="h-full w-full transition-transform duration-300 group-hover:scale-105" emojiSize={34} />
                  {discount >= 5 && (
                    <span className="grad-btn absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white">
                      -{discount}%
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-tang">{game.name}</p>
                      <Link to={`/loja/produto/${product.id}`} className="line-clamp-2 text-[13.5px] font-semibold text-white transition-colors hover:text-gold">
                        {product.title}
                      </Link>
                      {variantName && (
                        <p className="mt-0.5 text-[11px] font-bold text-tang">{variantName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        remove(product.id)
                        push('info', 'Removido do carrinho', product.title)
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sand/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Remover item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    {/* Quantidade */}
                    <div className="flex items-center gap-1 rounded-lg border border-edge/60 bg-[#1b120d] p-0.5">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-sand transition hover:text-gold"
                        aria-label="Diminuir"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center font-display text-[13px] font-bold text-white">{qty}</span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-sand transition hover:text-gold"
                        aria-label="Aumentar"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="text-right leading-tight">
                      <p className="font-display text-[16px] font-extrabold text-tang">{brl(displayPrice * qty)}</p>
                      {qty > 1 && <p className="text-[11px] text-sand/60">{brl(displayPrice)} cada</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          <Link to="/loja/catalogo" className="inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-gold transition-colors hover:underline">
            ← Continuar comprando
          </Link>
        </div>

        {/* Resumo */}
        <div className="h-fit rounded-3xl border border-edge/50 bg-card/60 p-5 lg:sticky lg:top-36">
          <h2 className="font-display mb-4 text-lg font-extrabold text-white">Resumo do pedido</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-sand">
              <span>Subtotal</span>
              <span className="font-semibold text-cream">{brl(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sand">
              <span>Taxa da plataforma</span>
              <span className="text-emerald-300">Grátis</span>
            </div>
            <div className="flex justify-between border-t border-edge/40 pt-2.5 text-[15px] font-bold">
              <span className="text-white">Total</span>
              <span className="font-display text-tang">{brl(subtotal)}</span>
            </div>
          </div>
          <Link
            to="/loja/checkout"
            className="grad-btn group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[15px] font-extrabold tracking-wide text-white shadow-[0_16px_36px_-12px_rgba(255,121,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            PROSSEGUIR PARA CHECKOUT
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-sand/60">
            🔒 Compra protegida • Pagamento só após a confirmação do pedido
          </p>
        </div>
      </div>
    </div>
  )
}