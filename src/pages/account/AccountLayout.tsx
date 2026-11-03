import { NavLink, Outlet } from 'react-router-dom'
import {
  CircleUserRound,
  Heart,
  LifeBuoy,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Wallet,
} from 'lucide-react'
import { getCurrentUser } from '../../lib/mockAuth'

const NAV = [
  { to: '/loja/conta', label: 'Meu perfil', icon: CircleUserRound, end: true },
  { to: '/loja/conta/compras', label: 'Minhas compras', icon: ShoppingCart },
  { to: '/loja/conta/vendas', label: 'Minhas vendas', icon: Store },
  { to: '/loja/vender', label: 'Meus anúncios', icon: Package },
  { to: '/loja/conta/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/loja/conta/carteira', label: 'Carteira', icon: Wallet },
  { to: '/loja/conta/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/loja/conta/suporte', label: 'Suporte', icon: LifeBuoy },
]

export default function AccountLayout() {
  const user = getCurrentUser()

  return (
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-5 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Minha conta</h1>
        <p className="mt-1 text-sm text-sand">
          Gerencie seu perfil, compras, vendas e carteira — tudo em um só lugar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        {/* Navegação lateral (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-36 space-y-1 rounded-2xl border border-edge/50 bg-card/50 p-2">
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition-all ${
                    isActive
                      ? 'grad-btn text-white shadow-[0_10px_24px_-10px_rgba(255,121,0,0.7)]'
                      : 'text-sand hover:bg-white/5 hover:text-gold'
                  }`
                }
              >
                <item.icon size={16} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Navegação mobile */}
        <div className="-mx-3 overflow-x-auto px-3 no-scrollbar lg:hidden">
          <nav className="flex w-max gap-1.5">
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-all ${
                    isActive ? 'grad-btn text-white' : 'border border-edge/50 text-sand'
                  }`
                }
              >
                <item.icon size={14} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <main className="min-w-0">
          <Outlet context={{ username: user?.username }} />
        </main>
      </div>
    </div>
  )
}