import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { EmptyState } from '../../components/store/Skeletons'

export function ProductNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <EmptyState
        icon={<PackageSearch size={30} />}
        title="Anúncio não encontrado"
        subtitle="Esse produto pode ter sido removido pelo vendedor ou não existe."
        action={
          <Link to="/loja/catalogo" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
            EXPLORAR CATÁLOGO
          </Link>
        }
      />
    </div>
  )
}