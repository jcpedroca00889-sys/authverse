import { memo } from 'react'
import type { Product } from '../../lib/types'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from './Skeletons'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
}

function ProductGrid({ products, loading, skeletonCount = 10 }: ProductGridProps) {
  if (loading) return <ProductGridSkeleton count={skeletonCount} />
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} delay={i * 0.03} />
      ))}
    </div>
  )
}

export default memo(ProductGrid)