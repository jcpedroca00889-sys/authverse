import { Link } from 'react-router-dom'
import { AlertTriangle, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import GameArt from '../../../components/store/GameArt'
import { brl } from '../../../lib/format'
import type { Product } from '../../../lib/types'

interface Props {
  product: Product
  confirmDelete: string | null
  onToggleStatus: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onConfirmDeleteChange: React.Dispatch<React.SetStateAction<string | null>>
}

export function ListingCard({ product: p, confirmDelete, onToggleStatus, onEdit, onDelete, onConfirmDeleteChange }: Props) {
  const confirm = confirmDelete === p.id

  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-edge/50 bg-card/60 p-3.5 transition-colors hover:border-edge">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
        <GameArt game={p.game} emoji={p.emoji} variant={p.art} className="h-full w-full" emojiSize={26} />
        {p.status === 'paused' && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[10px] font-bold uppercase tracking-wide text-cream">
            Pausado
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link to={`/loja/produto/${p.id}`} className="line-clamp-1 text-[13.5px] font-bold text-white hover:text-gold">
          {p.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-sand/75">
          <span className="font-display text-[15px] font-extrabold text-tang">{brl(p.price)}</span>
          <span>{p.category}</span>
          <span>{p.delivery === 'automatic' ? '⚡ Auto' : 'Manual'}</span>
          <span>{p.salesCount} vendas</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleStatus(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
            p.status === 'paused'
              ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
              : 'border-edge/60 text-sand hover:text-gold'
          }`}
          aria-label={p.status === 'paused' ? 'Reativar anúncio' : 'Pausar anúncio'}
        >
          {p.status === 'paused' ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>

        <button
          onClick={() => onEdit(p)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge/60 text-sand transition-colors hover:border-gold hover:text-gold"
          aria-label="Editar anúncio"
        >
          <Pencil size={15} />
        </button>

        <button
          onClick={() => (confirm ? onDelete(p.id) : onConfirmDeleteChange(p.id))}
          onMouseLeave={() => onConfirmDeleteChange((c) => (c === p.id ? null : c))}
          className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-bold transition-all ${
            confirm
              ? 'border-red-500/60 bg-red-500/15 text-red-300'
              : 'border-edge/60 text-sand/70 hover:border-red-400/50 hover:text-red-300'
          }`}
          aria-label="Excluir anúncio"
        >
          {confirm ? (
            <><AlertTriangle size={13} /> Confirmar</>
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </div>
  )
}