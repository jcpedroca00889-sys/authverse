import { Eye, Zap } from 'lucide-react'
import type { DeliveryType } from '../../../lib/types'

interface Props {
  value: DeliveryType
  onChange: (v: DeliveryType) => void
}

const OPTIONS = [
  { id: 'automatic' as const, label: 'Automática', desc: 'Entrega na hora, sem chat', icon: Zap },
  { id: 'manual' as const, label: 'Manual', desc: 'Combinada com o comprador', icon: Eye },
]

export function DeliveryTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
            value === o.id ? 'border-tang bg-tang/10' : 'border-edge/50 bg-[#1b120d]/50 hover:border-edge'
          }`}
        >
          <o.icon size={16} className={value === o.id ? 'text-tang' : 'text-sand'} />
          <span>
            <span className="block text-[13px] font-bold text-white">{o.label}</span>
            <span className="block text-[11px] text-sand">{o.desc}</span>
          </span>
        </button>
      ))}
    </div>
  )
}