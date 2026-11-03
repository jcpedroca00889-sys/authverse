import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store } from 'lucide-react'
import { EmptyState } from '../../components/store/Skeletons'
import { fetchSellerOrders } from '../../services/catalog'
import { brl, prettyDate } from '../../lib/format'
import { getCurrentUser } from '../../lib/mockAuth'
import type { Order } from '../../lib/types'

const STATUS_STYLE: Record<string, string> = {
  PAGO: 'bg-tang/15 text-tang',
  PENDENTE: 'bg-gold/15 text-gold',
  ENTREGUE: 'bg-emerald-500/15 text-emerald-300',
  CANCELADO: 'bg-red-500/15 text-red-300',
}

export default function SalesPage() {
  const user = getCurrentUser()!
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellerOrders(user.username).then((o) => {
      setOrders(o)
      setLoading(false)
    })
  }, [user.username])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-white">Minhas vendas</h2>
        <Link to="/loja/vender" className="rounded-xl border border-edge/60 px-3.5 py-2 text-[12.5px] font-bold text-gold transition-colors hover:border-gold/60 hover:bg-gold/10">
          Gerenciar anúncios
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#2c1d13]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Store size={30} />}
          title="Nenhuma venda ainda"
          subtitle="Seus anúncios ainda não receberam pedidos. Compartilhe seus produtos para aumentar as vendas!"
          action={
            <Link to="/loja/vender" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              ANUNCIAR PRODUTO
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o, idx) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-edge/50 bg-card/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-[13px] font-extrabold text-gold">{o.code}</p>
                  <p className="text-[11.5px] text-sand">
                    Comprador: <b className="text-cream">@{o.buyer}</b> • {prettyDate(o.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-display text-sm font-extrabold text-tang">{brl(o.total)}</span>
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 border-t border-edge/30 pt-2.5 text-[12.5px] text-sand">
                {o.items.map((i) => (
                  <span key={i.productId}>
                    {i.qty}x {i.title} <span className="text-edge">•</span>{' '}
                  </span>
                ))}
                <span className="ml-1 text-[11px] text-sand/60">({o.paymentMethod})</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}