import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'
import GameArt from '../../components/store/GameArt'
import { EmptyState } from '../../components/store/Skeletons'
import { fetchOrders } from '../../services/catalog'
import { brl, prettyDate } from '../../lib/format'
import { getCurrentUser } from '../../lib/mockAuth'
import type { Order } from '../../lib/types'

const STATUS_STYLE: Record<string, string> = {
  PAGO: 'bg-tang/15 text-tang',
  PENDENTE: 'bg-gold/15 text-gold',
  ENTREGUE: 'bg-emerald-500/15 text-emerald-300',
  CANCELADO: 'bg-red-500/15 text-red-300',
}

export default function PurchasesPage() {
  const user = getCurrentUser()!
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders(user.username).then((o) => {
      setOrders(o)
      setLoading(false)
    })
  }, [user.username])

  return (
    <div>
      <h2 className="font-display mb-4 text-xl font-extrabold text-white">Minhas compras</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#2c1d13]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={30} />}
          title="Nenhuma compra ainda"
          subtitle="Quando você finalizar um pedido, ele aparecerá aqui com o status de entrega."
          action={
            <Link to="/loja/catalogo" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              EXPLORAR OFERTAS
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o, idx) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-edge/50 bg-card/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-display text-[13px] font-extrabold text-gold">{o.code}</span>
                  {o.demo && (
                    <span className="rounded-md border border-dashed border-edge/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sand/60">
                      Demonstrativo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11.5px] text-sand/70">{prettyDate(o.date)}</span>
                  <span className="font-display text-sm font-extrabold text-tang">{brl(o.total)}</span>
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2 border-t border-edge/30 pt-3">
                {o.items.map((i) => (
                  <Link
                    key={i.productId}
                    to={`/loja/produto/${i.productId}`}
                    className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-[#2c1d13]"
                  >
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                      <GameArt game={i.game} emoji="🎁" variant={0} className="h-full w-full" emojiSize={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-semibold text-white">{i.title}</p>
                      <p className="text-[11px] text-sand/70">
                        {i.qty}x {brl(i.price)} • {i.delivery === 'automatic' ? '⚡ entrega automática' : '🕐 entrega manual'}
                      </p>
                    </div>
                    <span className="font-display text-[13px] font-bold text-cream">{brl(i.price * i.qty)}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-2.5 border-t border-edge/30 pt-2.5 text-[11.5px] text-sand/75">
                Pagamento: <b className="text-cream">{o.paymentMethod}</b> • {o.gateway === 'saldo' ? 'Saldo descontado da carteira' : 'Gateway simulado (mock)'}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}