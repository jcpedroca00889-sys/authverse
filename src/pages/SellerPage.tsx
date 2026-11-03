import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Flag,
  MessageCircle,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import Avatar from '../components/store/Avatar'
import ProductGrid from '../components/store/ProductGrid'
import StarRating from '../components/store/StarRating'
import { EmptyState, ProductGridSkeleton } from '../components/store/Skeletons'
import { fetchSeller, fetchSellerListings } from '../services/catalog'
import { useToasts } from '../state/StoreProviders'
import type { Product, Seller } from '../lib/types'
import { prettyDate } from '../lib/format'

export default function SellerPage() {
  const { username } = useParams()
  const { push } = useToasts()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [listings, setListings] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([fetchSeller(username ?? ''), fetchSellerListings(username ?? '')]).then(([s, l]) => {
      if (!alive) return
      setSeller(s)
      setListings(l)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [username])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        <div className="h-40 animate-pulse rounded-3xl bg-[#2c1d13]" />
        <div className="mt-6 h-6 w-64 animate-pulse rounded bg-[#2c1d13]" />
        <div className="mt-4">
          <ProductGridSkeleton count={5} />
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Vendedor não encontrado"
          subtitle="Este vendedor não possui anúncios ativos ou não existe na plataforma."
          action={
            <Link to="/loja/catalogo" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              EXPLORAR CATÁLOGO
            </Link>
          }
        />
      </div>
    )
  }

  const hasReputation = seller.rating > 0

  return (
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-5 sm:px-6">
      <nav className="mb-5 flex items-center gap-1.5 text-[12px] text-sand/70">
        <Link to="/loja" className="transition-colors hover:text-gold">Início</Link>
        <ChevronRight size={12} className="text-edge" />
        <span className="text-cream">Vendedor: {seller.displayName}</span>
      </nav>

      {/* Perfil */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-edge/50 bg-gradient-to-br from-[#24170f] to-[#1a100a] p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,121,0,0.18), transparent 65%)' }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar name={seller.username} size={88} />
            <div>
              <h1 className="font-display flex items-center gap-2 text-2xl font-extrabold text-white">
                {seller.displayName}
                {seller.verified && <BadgeCheck size={22} className="fill-sky-500/90 text-white" />}
              </h1>
              <p className="mt-0.5 text-sm text-sand">@{seller.username}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {hasReputation ? (
                  <StarRating rating={seller.rating} count={seller.ratingCount} size={15} />
                ) : (
                  <span className="rounded-lg border border-edge/60 bg-[#1b120d] px-2.5 py-1 text-[11px] font-bold text-sand">
                    NOVO NA PLATAFORMA
                  </span>
                )}
                <span className="text-xs text-sand/70">• {seller.salesCount} vendas</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:ml-auto">
            {[
              { icon: <Bell size={14} />, label: 'Responde em', value: seller.responseTime },
              { icon: <ShieldCheck size={14} />, label: 'Na plataforma desde', value: prettyDate(seller.memberSince) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-edge/60 bg-[#1b120d]/80 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sand/60">
                  {s.icon} {s.label}
                </span>
                <span className="mt-0.5 block font-display text-sm font-bold text-gold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {seller.description && (
          <p className="relative mt-5 max-w-2xl text-sm leading-relaxed text-cream/80">{seller.description}</p>
        )}

        <div className="relative mt-5 flex flex-wrap gap-2">
          {seller.tags.map((t) => (
            <span key={t} className="rounded-lg border border-tang/30 bg-tang/10 px-2.5 py-1 text-[11px] font-semibold text-tang">
              {t}
            </span>
          ))}
          <button
            onClick={() => push('info', 'Notificação enviada', 'Você será avisado quando o vendedor responder.')}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-edge/60 px-4 py-2 text-[12.5px] font-bold text-sand transition-colors hover:border-gold hover:text-gold"
          >
            <MessageCircle size={14} /> Seguir vendedor
          </button>
          <button
            onClick={() => push('info', 'Denúncia registrada', 'Nossa equipe vai analisar.')}
            className="flex items-center gap-1.5 rounded-xl border border-edge/60 px-4 py-2 text-[12.5px] font-bold text-sand/70 transition-colors hover:border-red-400/50 hover:text-red-300"
          >
            <Flag size={14} /> Denunciar
          </button>
        </div>
      </motion.section>

      {/* Anúncios */}
      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold text-white">Anúncios deste vendedor</h2>
            <p className="mt-1 text-sm text-sand">{listings.length} anúncios ativos</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-xl border border-edge/50 bg-card/50 px-3 py-1.5 text-[11px] font-semibold text-sand sm:flex">
            <Timer size={12} className="text-tang" /> Responde em {seller.responseTime}
          </span>
        </div>
        {listings.length === 0 ? (
          <EmptyState
            title="Nenhum anúncio ativo"
            subtitle="Este vendedor ainda não publicou anúncios ou todos estão pausados."
          />
        ) : (
          <ProductGrid products={listings} skeletonCount={5} />
        )}
      </div>
    </div>
  )
}