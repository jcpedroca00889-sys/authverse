import { Package, Plus, TrendingUp } from 'lucide-react'
import type { TabId } from '../hooks/useSellerDashboard'

interface Props {
  activeTab: TabId
  listingsCount: number
  onTabChange: (tab: TabId) => void
}

const TABS: Array<{ id: TabId; label: string; icon: typeof Package }> = [
  { id: 'anunciar', label: 'Anunciar produto', icon: Plus },
  { id: 'anuncios', label: 'Meus anúncios', icon: Package },
  { id: 'vendas', label: 'Vendas', icon: TrendingUp },
]

export function TabNavigation({ activeTab, listingsCount, onTabChange }: Props) {
  return (
    <div className="mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-edge/50 bg-card/50 p-1.5 no-scrollbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all ${
            activeTab === t.id ? 'grad-btn text-white shadow-lg' : 'text-sand hover:text-gold'
          }`}
        >
          <t.icon size={15} /> {t.label}
          {t.id === 'anuncios' && listingsCount > 0 && (
            <span className={`rounded-md px-1.5 text-[11px] ${activeTab === t.id ? 'bg-black/20' : 'bg-edge/40'}`}>
              {listingsCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}