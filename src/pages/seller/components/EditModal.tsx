import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, X } from 'lucide-react'
import { ListingForm } from './ListingForm'
import type { ListingInput, Product } from '../../../lib/types'

interface Props {
  editing: Product | null
  submitting: boolean
  onUpdate: (input: ListingInput) => void
  onClose: () => void
}

export function EditModal({ editing, submitting, onUpdate, onClose }: Props) {
  return (
    <AnimatePresence>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center store-scroll">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative w-full max-w-3xl rounded-3xl border border-edge/70 bg-[#1c120b] p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-white">
                <Pencil size={17} className="text-tang" /> Editar anúncio
              </h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge/60 text-sand hover:text-gold"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <ListingForm
              initial={editing}
              submitting={submitting}
              onSubmit={onUpdate}
              onCancel={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}