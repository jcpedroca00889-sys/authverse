import ProductGrid from '../../components/store/ProductGrid'
import { ProductGridSkeleton } from '../../components/store/Skeletons'
import type { Product } from '../../lib/types'

interface Props {
  related: Product[]
}

export function ProductRelated({ related }: Props) {
  return (
    <div className="mt-12">
      <div className="mb-4">
        <h2 className="font-display text-xl font-extrabold text-white">Produtos relacionados</h2>
        <div className="mt-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-ember to-gold" />
      </div>
      {related.length === 0 ? <ProductGridSkeleton count={5} /> : <ProductGrid products={related} skeletonCount={5} />}
    </div>
  )
}