import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Product } from '../../lib/types'
import ProductGrid from './ProductGrid'

interface SectionShelfProps {
  title: string
  icon?: ReactNode
  products: Product[]
  loading?: boolean
  query?: string
  id?: string
}

/** Vitrine com título, botão VER TODOS e grid de produtos. */
function SectionShelf({ title, icon, products, loading, query, id }: SectionShelfProps) {
  return (
    <section id={id} className="scroll-mt-36">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-edge/60 bg-[#1b120d] text-tang">
                {icon}
              </span>
            )}
            <h2 className="font-display text-xl font-extrabold tracking-tight text-white sm:text-[22px]">
              {title}
            </h2>
          </div>
          <div className="mt-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-ember to-gold" />
        </div>
        {products.length > 0 && (
          <Link
            to={query ? `/loja/catalogo?${query}` : '/loja/catalogo'}
            className="group flex shrink-0 items-center gap-1 rounded-xl border border-edge/60 px-3 py-1.5 text-[12px] font-bold tracking-wide text-gold transition-all duration-200 hover:border-gold/60 hover:bg-gold/10"
          >
            VER TODOS
            <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <ProductGrid products={products} loading={loading} skeletonCount={10} />
    </section>
  )
}

export default memo(SectionShelf)