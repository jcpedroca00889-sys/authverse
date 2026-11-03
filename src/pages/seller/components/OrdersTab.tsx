import { motion } from 'framer-motion'
import { CheckCircle2, TrendingUp } from 'lucide-react'
import { EmptyState } from '../../../components/store/Skeletons'
import { brl, prettyDate } from '../../../lib/format'
import type { Order } from '../../../lib/types'

interface Props {
  orders: Order[]
  loading: boolean
}

export function OrdersTab({ orders, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#2c1d13]" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <EmptyState
          icon={<TrendingUp size={30} />}
          title="Nenhuma venda ainda"
          subtitle="Quando um comprador adquirir um dos seus anúncios, o pedido aparecerá aqui."
        />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-edge/50 bg-card/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-white">{o.code}</p>
                  <p className="text-[11.5px] text-sand">Comprador: @{o.buyer} • {prettyDate(o.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                  o.status === 'ENTREGUE' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-tang/15 text-tang'
                }`}>
                  {o.status}
                </span>
                <span className="font-display text-[15px] font-extrabold text-tang">{brl(o.total)}</span>
              </div>
            </div>
            <div className="mt-2.5 border-t border-edge/30 pt-2.5 text-[12.5px] text-sand">
              {o.items.map((i) => (
                <span key={i.productId}>
                  {i.qty}x {i.title}{' '}
                  <span className="text-edge">•</span>{' '}
                </span>
              ))}
              <span className="text-[11px] text-sand/60">({o.paymentMethod})</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}