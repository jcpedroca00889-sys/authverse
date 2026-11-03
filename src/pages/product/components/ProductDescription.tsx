import type { Product } from '../../lib/types'

interface Props {
  product: Product
}

export function ProductDescription({ product }: Props) {
  return (
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
  )
}