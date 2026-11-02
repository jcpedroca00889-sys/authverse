import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, X } from 'lucide-react';
import ProductArt from './ProductArt';
import { brl, categoryLabel, type Product } from '../../services/store';
import { useToast } from '../Toast';

export default function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const toast = useToast();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="glass relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Fechar detalhes"
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition hover:border-rose-300/50 hover:text-rose-200"
        >
          <X size={16} />
        </button>

        <div className="grid gap-5 sm:grid-cols-[1fr_1.05fr]">
          <ProductArt
            glyph={product.glyph}
            accent={product.accent}
            className="group aspect-[4/3] rounded-2xl border border-white/10 sm:aspect-auto sm:min-h-[320px]"
          />

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 font-semibold uppercase tracking-wider text-cyan-200">
                {categoryLabel(product.category)}
              </span>
              {product.badge && (
                <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 font-semibold uppercase tracking-wider text-violet-200">
                  {product.badge}
                </span>
              )}
              <span className="flex items-center gap-1 text-amber-200">
                <Star size={11} className="fill-amber-300 text-amber-300" />
                {product.rating.toFixed(1)} · {product.reviews} avaliações
              </span>
            </div>

            <h2 className="mt-2 pr-8 text-2xl font-bold text-white">{product.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{product.tagline}</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">{product.description}</p>

            <ul className="mt-4 grid grid-cols-1 gap-1.5 text-xs text-slate-300 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5">
                  <Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5">
              <div className="flex items-end gap-2">
                {product.oldPrice && (
                  <span className="text-xs text-slate-500 line-through">{brl(product.oldPrice)}</span>
                )}
                <span className="text-2xl font-bold text-white">
                  {brl(product.price)}
                  {product.period && <span className="text-xs font-normal text-slate-400">/{product.period}</span>}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{product.meta} · Entrega instantânea · Licença comercial</p>

              <button
                type="button"
                onClick={() => toast('info', 'Checkout será habilitado na próxima etapa.')}
                className="btn-neon mt-4"
              >
                Obter acesso
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
