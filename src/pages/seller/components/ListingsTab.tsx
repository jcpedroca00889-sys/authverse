import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Plus, Store } from 'lucide-react'
import { EmptyState } from '../../../components/store/Skeletons'
import { ListingCard } from './ListingCard'
import type { Product } from '../../../lib/types'

interface Props {
  listings: Product[]
  confirmDelete: string | null
  onToggleStatus: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onConfirmDeleteChange: React.Dispatch<React.SetStateAction<string | null>>
  onNavigateAnunciar: () => void
}

export function ListingsTab({
  listings,
  confirmDelete,
  onToggleStatus,
  onEdit,
  onDelete,
  onConfirmDeleteChange,
  onNavigateAnunciar,
}: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {listings.length === 0 ? (
        <EmptyState
          icon={<Package size={30} />}
          title="Você ainda não tem anúncios"
          subtitle="Publique seu primeiro produto e comece a vender na MONKEY LARANJA."
          action={
            <button onClick={onNavigateAnunciar} className="grad-btn flex items-center gap-1.5 rounded-xl px-5 py-3 font-display text-sm font-bold text-white">
              <Plus size={16} /> ANUNCIAR PRODUTO
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between rounded-xl border border-sky-500/25 bg-sky-500/8 px-4 py-2.5 text-[12px] text-sky-200/85">
            <span className="flex items-center gap-2"><Store size={13} /> Seus anúncios aparecem no catálogo da loja imediatamente.</span>
            <Link to="/loja" className="font-bold text-sky-300 hover:underline">Ver na loja →</Link>
          </div>
          {listings.map((p) => (
            <ListingCard
              key={p.id}
              product={p}
              confirmDelete={confirmDelete}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              onConfirmDeleteChange={onConfirmDeleteChange}
            />
          ))}
        </>
      )}
    </motion.div>
  )
}