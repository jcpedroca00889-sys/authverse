import { ArrowRight, Star } from 'lucide-react';
import ProductArt from './ProductArt';
import { brl, categoryLabel, type Product } from '../../services/store';

const BADGE_STYLES: Record<string, string> = {
  Top: 'border-violet-400/40 bg-violet-500/15 text-violet-200',
  Novo: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
  Oferta: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
};

export default function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition-all duration-300 hover:border-cyan-400/60 hover:bg-white/[0.05] hover:shadow-[0_28px_70px_-24px_rgba(0,0,0,.5)] snap-center flex-none w-[252px] sm:w-[300px]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`Ver detalhes de ${product.name}`}
          className="absolute inset-0"
        >
          <ProductArt glyph={product.glyph} accent={product.accent} className="h-full w-full" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.20] px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm shadow-lg">
              Ver detalhes <ArrowRight size={13} />
            </span>
          </div>
        </button>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge && (
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${BADGE_STYLES[product.badge] ?? BADGE_STYLES.Novo}`}>
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 backdrop-blur-md">
              -{discount}%
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-2 py-0.5 text-[10px] font-medium text-amber-200 backdrop-blur-md">
          <Star size={11} className="fill-amber-300 text-amber-300" />
          {product.rating.toFixed(1)}
        </div>
      </div>
      <div className="flex-1 flex-col p-4">
        <span className="text-[10px] uppercase tracking-[.16em] text-slate-500">{categoryLabel(product.category)}</span>
        <h3 className="mt-1 text-sm font-semibold text-slate-100 leading-snug group-hover:text-cyan-200 transition-colors">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{product.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {product.oldPrice && (
              <span className="text-[11px] text-slate-500 line-through block">{brl(product.oldPrice)}</span>
            )}
            <span className="text-base font-bold text-white">{brl(product.price)}</span>
          </div>
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
          >
            Detalhes
          </button>
        </div>
      </div>
    </article>
  );
}
