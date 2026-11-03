import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductGrid from '../../components/store/ProductGrid'
import { EmptyState } from '../../components/store/Skeletons'
import { getAllProducts } from '../../services/catalog'
import { useFavorites } from '../../state/StoreProviders'

export default function FavoritesPage() {
  const { ids } = useFavorites()

  const products = useMemo(
    () => getAllProducts().filter((p) => ids.includes(p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ids],
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-white">Favoritos</h2>
        {products.length > 0 && <span className="text-sm text-sand">{products.length} salvos</span>}
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={<Heart size={30} />}
          title="Nenhum favorito ainda"
          subtitle="Toque no coração dos produtos que você gosta para salvá-los aqui."
          action={
            <Link to="/loja/catalogo" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              EXPLORAR CATÁLOGO
            </Link>
          }
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}