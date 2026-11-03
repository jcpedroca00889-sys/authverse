import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  ChevronRight,
  Flag,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingCart,
  Timer,
  Truck,
  Zap,
} from 'lucide-react'
import GameArt from '../components/store/GameArt'
import StarRating from '../components/store/StarRating'
import Avatar from '../components/store/Avatar'
import VariantSelector from '../components/store/VariantSelector'
import ProductGrid from '../components/store/ProductGrid'
import { EmptyState, ProductGridSkeleton } from '../components/store/Skeletons'
import { gameBySlug, discountPct, sellerByUsername } from '../data/catalog'
import { brl, prettyDate, shortDate } from '../lib/format'
import { fetchProductById, fetchRelated } from '../services/catalog'
import { useCart, useFavorites, useToasts } from '../state/StoreProviders'
import type { Product, ProductVariant } from '../lib/types'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add } = useCart()
  const { has, toggle } = useFavorites()
  const { push } = useToasts()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [variantName, setVariantName] = useState<string>('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    window.scrollTo({ top: 0 })
    setGalleryIdx(0)
    setQty(1)
    fetchProductById(id ?? '').then(async (p) => {
      if (!alive) return
      setProduct(p)
      setLoading(false)
      // Seleciona a primeira variação como padrão (se houver)
      if (p?.variants && p.variants.length > 0) {
        setVariantName(p.variants[0].name)
      }
      if (p) {
        const rel = await fetchRelated(p, 5)
        if (alive) setRelated(rel)
      }
    })
    return () => {
      alive = false
    }
  }, [id])

  const game = product ? gameBySlug(product.game) : null
  const seller = product ? sellerByUsername(product.sellerUsername) : null
  const discount = product ? discountPct(product) : 0
  const fav = product ? has(product.id) : false

  // Variação selecionada
  const selectedVariant: ProductVariant | undefined = product?.variants?.find((v) => v.name === variantName)
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0
  const currentOldPrice = selectedVariant?.oldPrice ?? product?.oldPrice
  const currentDiscount = selectedVariant
    ? selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price
      ? Math.round(((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100)
      : 0
    : discount
  const minQty = selectedVariant?.minQty ?? 1
  const maxQty = selectedVariant?.maxQty ?? product?.stock ?? 99
  const hasVariants = product?.variants && product.variants.length > 0

  const galleryVariants = useMemo(() => [0, 2, 5], [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        <div className="h-4 w-72 animate-pulse rounded bg-[#2c1d13]" />
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="aspect-square animate-pulse rounded-3xl bg-[#2c1d13]" />
          <div className="space-y-4">
            <div className="h-6 w-full animate-pulse rounded bg-[#2c1d13]" />
            <div className="h-10 w-40 animate-pulse rounded bg-[#2c1d13]" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-[#2c1d13]" />
          </div>
        </div>
      </div>
    )
  }

  if (!product || !game) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<PackageSearch size={30} />}
          title="Anúncio não encontrado"
          subtitle="Esse produto pode ter sido removido pelo vendedor ou não existe."
          action={
            <Link to="/loja/catalogo" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              EXPLORAR CATÁLOGO
            </Link>
          }
        />
      </div>
    )
  }

  const buyNow = () => {
    add(product, qty, selectedVariant?.name)
    navigate('/loja/checkout')
  }

  const addToCart = () => {
    add(product, qty, selectedVariant?.name)
    push('success', 'Adicionado ao carrinho! 🛒', `${qty}x ${product.title}`)
  }

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewText.trim().length < 10) {
      push('error', 'Avaliação muito curta', 'Escreva pelo menos 10 caracteres.')
      return
    }
    push('success', 'Avaliação enviada! ⭐', 'Obrigado por contribuir com a comunidade.')
    setReviewText('')
    setReviewRating(5)
  }

  const report = () => {
    push('info', 'Denúncia registrada', 'Nossa equipe vai analisar o anúncio em até 24h.')
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-5 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-sand/70">
        <Link to="/loja" className="transition-colors hover:text-gold">Início</Link>
        <ChevronRight size={12} className="text-edge" />
        <Link to={`/loja/categoria/${product.game}`} className="transition-colors hover:text-gold">{game.name}</Link>
        <ChevronRight size={12} className="text-edge" />
        <span className="line-clamp-1 max-w-[240px] text-cream">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ── Galeria ── */}
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

          {/* Miniaturas */}
          <div className="mt-3 flex gap-3">
            {galleryVariants.map((v, i) => (
              <button
                key={v}
                onClick={() => setGalleryIdx(i)}
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

        {/* ── Coluna de compra ── */}
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-edge/50 bg-card/60 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sand/70">
                  <span className="text-tang">{game.short}</span>
                  <span className="text-edge">•</span>
                  <span>{product.category}</span>
                </div>
                <h1 className="font-display mt-1.5 text-xl font-extrabold leading-tight text-white sm:text-2xl">
                  {product.title}
                </h1>
              </div>
              <motion.button
                onClick={() => {
                  toggle(product.id)
                  push(fav ? 'info' : 'success', fav ? 'Removido dos favoritos' : 'Salvo nos favoritos ❤️')
                }}
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
                {brl(currentPrice)}
              </span>
              {currentOldPrice && currentOldPrice > currentPrice && (
                <span className="pb-1 text-sm text-sand/55 line-through">{brl(currentOldPrice)}</span>
              )}
              {currentDiscount >= 5 && (
                <span className="mb-1.5 ml-auto rounded-lg bg-red-500/20 px-2 py-0.5 font-display text-[13px] font-extrabold text-red-300">
                  -{currentDiscount}%
                </span>
              )}
            </div>

            {/* ── Variações ── */}
            {hasVariants && product.variants && (
              <div className="mt-4">
                <VariantSelector
                  variants={product.variants}
                  selected={variantName}
                  onSelect={(name) => {
                    setVariantName(name)
                    setQty(1)
                  }}
                  category={product.category}
                />
              </div>
            )}

            {/* Quantidade */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-sand">Quantidade</span>
              <div className="flex items-center gap-1 rounded-xl border border-edge/60 bg-[#1b120d] p-1">
                <button
                  onClick={() => setQty((q) => Math.max(minQty, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sand transition hover:bg-white/5 hover:text-gold"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-display text-sm font-bold text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(Math.max(minQty, maxQty), q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sand transition hover:bg-white/5 hover:text-gold"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            {maxQty < 99 && (
              <p className="text-[11px] text-sand/50">Mín. {minQty} • Máx. {maxQty} unidades por pedido</p>
            )}

            <div className="mt-4 flex flex-col gap-2.5">
              <motion.button
                onClick={buyNow}
                whileTap={{ scale: 0.98 }}
                className="grad-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[15px] font-extrabold tracking-wide text-white shadow-[0_16px_36px_-12px_rgba(255,121,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
              >
                <Zap size={18} strokeWidth={2.6} /> COMPRAR AGORA
              </motion.button>
              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gold/60 py-3 font-display text-sm font-bold tracking-wide text-gold transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold/10"
              >
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

          {/* ── Vendedor ── */}
          <div className="rounded-3xl border border-edge/50 bg-card/60 p-5">
            <h2 className="font-display mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white">
              Vendedor
            </h2>
            <div className="flex items-center gap-3">
              <Avatar name={product.sellerUsername} size={52} />
              <div className="min-w-0">
                <Link
                  to={`/loja/vendedor/${product.sellerUsername}`}
                  className="flex items-center gap-1.5 font-display text-[15px] font-bold text-white transition-colors hover:text-gold"
                >
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
            <Link
              to={`/loja/vendedor/${product.sellerUsername}`}
              className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-edge/60 py-2 text-[12.5px] font-bold tracking-wide text-sand transition-colors hover:border-gold/60 hover:text-gold"
            >
              VER PERFIL DO VENDEDOR <ChevronRight size={13} />
            </Link>
          </div>

          {/* Reputação + denúncia */}
          <div className="flex items-center justify-between rounded-3xl border border-dashed border-edge/50 bg-card/30 px-5 py-3.5">
            <span className="flex items-center gap-2 text-[12px] text-sand">
              <ShieldCheck size={15} className="text-emerald-400" /> Reputação: {seller?.verified ? 'vendedor verificado' : 'anúncio em análise'}
            </span>
            <button onClick={report} className="flex items-center gap-1.5 text-[12px] font-semibold text-sand/70 transition-colors hover:text-red-300">
              <Flag size={13} /> Denunciar
            </button>
          </div>
        </div>
      </div>

      {/* ── Descrição + informações + avaliações ── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-edge/50 bg-card/60 p-6">
            <h2 className="font-display mb-3 text-lg font-extrabold text-white">Descrição</h2>
            <p className="text-sm leading-relaxed text-cream/85">{product.description}</p>
            {product.details.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {product.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-[13px] text-sand">
                    <span className="grad-btn flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
            {product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-lg border border-tang/30 bg-tang/10 px-2.5 py-1 text-[11px] font-semibold text-tang">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Avaliações */}
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
            <form onSubmit={submitReview} className="mt-4 rounded-2xl border border-edge/40 bg-[#1b120d]/70 p-4">
              <p className="mb-2 text-[13px] font-semibold text-cream">Deixe sua avaliação</p>
              <div className="mb-2.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="text-xl transition-transform hover:scale-110"
                    aria-label={`${s} estrelas`}
                  >
                    <Star rating={s <= reviewRating} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Conte como foi sua experiência com este produto..."
                  className="h-10 flex-1 rounded-xl border border-edge/60 bg-[#17100c] px-3.5 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang"
                />
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="submit"
                  className="grad-btn flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  aria-label="Enviar avaliação"
                >
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
        </div>

        {/* Informações do produto */}
        <div className="h-fit rounded-3xl border border-edge/50 bg-card/60 p-6 lg:sticky lg:top-36">
          <h2 className="font-display mb-4 text-lg font-extrabold text-white">Informações do produto</h2>
          <dl className="space-y-3 text-[13px]">
            {[
              ['Jogo', game.name],
              ['Categoria', product.category],
              ['Tipo de entrega', product.delivery === 'automatic' ? 'Automática (na hora)' : 'Manual (até 24h)'],
              ['Garantia', '7 dias após a entrega'],
              ['Estoque', `${product.stock} unidade(s)`],
              ['Anunciado em', prettyDate(product.createdAt)],
              ['Código do anúncio', product.id.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3 border-b border-edge/30 pb-2.5 last:border-0 last:pb-0">
                <dt className="text-sand/70">{k}</dt>
                <dd className="text-right font-semibold text-cream">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 text-[12.5px] leading-relaxed text-emerald-100/85">
            <p className="mb-1 flex items-center gap-1.5 font-bold text-emerald-300">
              <ShieldCheck size={14} /> Compra protegida
            </p>
            Se algo der errado, a MONKEY LARANJA garante o reembolso conforme a política de proteção ao comprador.
          </div>
        </div>
      </div>

      {/* Relacionados */}
      <div className="mt-12">
        <div className="mb-4">
          <h2 className="font-display text-xl font-extrabold text-white">Produtos relacionados</h2>
          <div className="mt-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-ember to-gold" />
        </div>
        {related.length === 0 ? <ProductGridSkeleton count={5} /> : <ProductGrid products={related} skeletonCount={5} />}
      </div>
    </div>
  )
}

function Star({ rating }: { rating: boolean }) {
  return (
    <span className={rating ? 'text-gold' : 'text-edge'} aria-hidden>
      ★
    </span>
  )
}