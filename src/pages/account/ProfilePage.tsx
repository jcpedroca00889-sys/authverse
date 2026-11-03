import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Heart, Package, ShoppingCart, Wallet } from 'lucide-react'
import Avatar from '../../components/store/Avatar'
import { getMyListings, fetchOrders } from '../../services/catalog'
import { useFavorites, useWallet } from '../../state/StoreProviders'
import { brl, prettyDate } from '../../lib/format'
import { supabase, getSessionToken } from '../../lib/supabase'
import { getCurrentUser } from '../../lib/mockAuth'
import type { Order } from '../../lib/types'

export default function ProfilePage() {
  const user = getCurrentUser()!
  const { balance } = useWallet()
  const { ids } = useFavorites()
  const [orders, setOrders] = useState<Order[]>([])
  const [memberSince, setMemberSince] = useState('')

  useEffect(() => {
    fetchOrders(user.username).then(setOrders)
    // Data de criação vem da tabela app_users (RPC app_me)
    const token = getSessionToken()
    if (token) {
      supabase.rpc('app_me', { p_token: token }).then(({ data }) => {
        if (data?.created_at) setMemberSince(data.created_at)
      })
    }
  }, [user.username])

  const listingsCount = getMyListings(user.username).length

  const stats = [
    { icon: ShoppingCart, label: 'Compras', value: orders.length, to: '/loja/conta/compras' },
    { icon: Package, label: 'Meus anúncios', value: listingsCount, to: '/loja/vender' },
    { icon: Heart, label: 'Favoritos', value: ids.length, to: '/loja/conta/favoritos' },
  ]

  return (
    <div className="space-y-5">
      {/* Card principal */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-edge/50 bg-gradient-to-br from-[#24170f] to-[#1a100a] p-6 sm:p-7"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,121,0,0.18), transparent 65%)' }}
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="relative">
            <Avatar name={user.username} size={84} />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#1a100a] bg-emerald-500 text-[11px]">
              ✓
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display flex items-center gap-2 text-xl font-extrabold text-white">
              @{user.username}
            </h2>
            <p className="mt-0.5 text-[13px] text-sand">
              {memberSince ? `Membro desde ${prettyDate(memberSince)}` : 'Conta MONKEY LARANJA'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-lg border border-tang/30 bg-tang/10 px-2.5 py-1 text-[11px] font-bold text-tang">
                COMPRADOR
              </span>
              <span className="rounded-lg border border-edge/60 bg-[#1b120d] px-2.5 py-1 text-[11px] font-bold text-sand">
                VENDEDOR
              </span>
            </div>
          </div>
          <Link
            to="/loja/conta/carteira"
            className="group flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/8 px-5 py-3.5 transition-all hover:border-gold/60"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Wallet size={19} />
            </span>
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-sand/70">Saldo</span>
              <span className="font-display block text-lg font-extrabold leading-tight text-gold">{brl(balance)}</span>
            </span>
            <ArrowRight size={15} className="text-sand/50 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
          </Link>
        </div>
      </motion.section>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={s.to}
              className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-edge/50 bg-card/60 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-tang/60"
            >
              <s.icon size={20} className="text-tang" />
              <span className="font-display text-2xl font-extrabold text-white">{s.value}</span>
              <span className="text-[11.5px] font-medium text-sand">{s.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Nota demo */}
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-edge/60 bg-card/30 px-5 py-4 text-[12.5px] leading-relaxed text-sand">
        <Coins size={17} className="mt-0.5 shrink-0 text-gold" />
        <p>
          Compras, saldo, favoritos e anúncios ficam salvos no Supabase. Apenas o carrinho e as
          configurações deste navegador podem ser limpos em{' '}
          <Link to="/loja/conta/configuracoes" className="font-bold text-gold hover:underline">Configurações</Link>.
        </p>
      </div>
    </div>
  )
}