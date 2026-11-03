import { ShieldCheck } from 'lucide-react'
import { prettyDate } from '../../lib/format'
import type { GameInfo, Product } from '../../lib/types'

interface Props {
  product: Product
  game: GameInfo | null
}

export function ProductInfoSidebar({ product, game }: Props) {
  return (
    <div className="h-fit rounded-3xl border border-edge/50 bg-card/60 p-6 lg:sticky lg:top-36">
      <h2 className="font-display mb-4 text-lg font-extrabold text-white">Informações do produto</h2>
      <dl className="space-y-3 text-[13px]">
        {([
          ['Jogo', game?.name ?? ''],
          ['Categoria', product.category],
          ['Tipo de entrega', product.delivery === 'automatic' ? 'Automática (na hora)' : 'Manual (até 24h)'],
          ['Garantia', '7 dias após a entrega'],
          ['Estoque', `${product.stock} unidade(s)`],
          ['Anunciado em', prettyDate(product.createdAt)],
          ['Código do anúncio', product.id.toUpperCase()],
        ] as const).map(([k, v]) => (
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
  )
}