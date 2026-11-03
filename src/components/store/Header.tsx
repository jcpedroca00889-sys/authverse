import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  LifeBuoy,
  ShoppingCart,
  Store,
  Tag,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import Logo from './Logo'
import Avatar from './Avatar'
import { GAMES } from '../../data/catalog'
import { brl } from '../../lib/format'
import { logout, getCurrentUser } from '../../lib/mockAuth'
import { useCart, useWallet } from '../../state/StoreProviders'

const NAV_GAMES = GAMES.filter((g) => g.slug !== 'outros')

const NOTIFS = [
  { id: 1, title: 'Pedido entregue 🎉', desc: 'Sua compra de Blox Fruits foi entregue com sucesso.', time: 'há 2 h', unread: true },
  { id: 2, title: 'Oferta nova pra você', desc: 'Frutas míticas com 25% OFF só hoje.', time: 'há 5 h', unread: true },
  { id: 3, title: 'Carteira atualizada', desc: 'Seu saldo foi creditado. Que tal aproveitar?', time: 'há 1 dia', unread: true },
]

const ACCOUNT_LINKS = [
  { to: '/loja/conta', label: 'Meu perfil', icon: CircleUserRound },
  { to: '/loja/conta/compras', label: 'Minhas compras', icon: ShoppingCart },
  { to: '/loja/conta/vendas', label: 'Minhas vendas', icon: Store },
  { to: '/loja/vender', label: 'Meus anúncios', icon: Package },
  { to: '/loja/conta/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/loja/conta/carteira', label: 'Carteira', icon: Wallet },
  { to: '/loja/conta/carteira', label: 'Histórico de transações', icon: History },
  { to: '/loja/conta/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/loja/conta/suporte', label: 'Suporte', icon: LifeBuoy },
]

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return ref
}

export default function Header() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const { count } = useCart()
  const { balance } = useWallet()

  const [q, setQ] = useState('')
  const [openMenu, setOpenMenu] = useState<'none' | 'account' | 'notif' | 'categories' | 'mobile'>('none')
  const [notifs, setNotifs] = useState(NOTIFS)

  const closeAll = () => setOpenMenu('none')
  const accountRef = useClickOutside(() => setOpenMenu((m) => (m === 'account' ? 'none' : m)))
  const notifRef = useClickOutside(() => setOpenMenu((m) => (m === 'notif' ? 'none' : m)))
  const catRef = useClickOutside(() => setOpenMenu((m) => (m === 'categories' ? 'none' : m)))

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault()
    closeAll()
    const term = q.trim()
    navigate(term ? `/loja/catalogo?q=${encodeURIComponent(term)}` : '/loja/catalogo')
  }

  const signOut = () => {
    closeAll()
    logout()
    navigate('/')
  }

  const unread = notifs.filter((n) => n.unread !== false).length

  const notifBtn = (
    <button
      onClick={() => setOpenMenu((m) => (m === 'notif' ? 'none' : 'notif'))}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-edge/60 bg-card/60 text-sand transition-colors hover:border-tang/60 hover:text-gold"
      aria-label="Notificações"
    >
      <Bell size={19} />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-burnt px-1 text-[10px] font-bold text-white ring-2 ring-coal">
          {unread}
        </span>
      )}
    </button>
  )

  const cartBtn = (
    <Link
      to="/loja/carrinho"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-edge/60 bg-card/60 text-sand transition-colors hover:border-tang/60 hover:text-gold"
      aria-label="Carrinho"
    >
      <ShoppingCart size={19} />
      {count > 0 && (
        <span className="grad-btn absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-coal">
          {count}
        </span>
      )}
    </Link>
  )

  const walletChip = (
    <Link
      to="/loja/conta/carteira"
      className="hidden items-center gap-2 rounded-xl border border-edge/60 bg-card/60 py-1.5 pl-3 pr-1.5 transition-colors hover:border-gold/60 md:flex"
    >
      <Wallet size={16} className="text-gold" />
      <span className="font-display text-sm font-extrabold text-white">{brl(balance)}</span>
      <span className="grad-btn ml-1 flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold text-white shadow transition hover:brightness-110">
        <Plus size={12} strokeWidth={3} /> Adicionar
      </span>
    </Link>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-edge/50 bg-coal/95 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md">
      {/* ── Linha 1 ── */}
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-6">
        {/* Mobile: menu + logo */}
        <button
          onClick={() => setOpenMenu((m) => (m === 'mobile' ? 'none' : 'mobile'))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-edge/60 text-sand transition-colors hover:text-gold lg:hidden"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
        <Logo />

        {/* Busca desktop */}
        <form onSubmit={doSearch} className="relative mx-auto hidden w-full max-w-xl flex-1 md:block">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sand/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contas, itens, moedas, skins..."
            className="h-11 w-full rounded-2xl border border-edge/70 bg-[#1b120d] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-sand/45 focus:border-tang focus:shadow-[0_0_0_3px_rgba(255,149,0,0.12),0_0_22px_-6px_rgba(255,149,0,0.4)]"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {walletChip}
          <div ref={notifRef} className="relative">
            {notifBtn}
            <AnimatePresence>
              {openMenu === 'notif' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-12 w-[300px] overflow-hidden rounded-2xl border border-edge/70 bg-[#24170f] shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-edge/50 px-4 py-3">
                    <span className="font-display text-sm font-bold text-white">Notificações</span>
                    <button
                      onClick={() => setNotifs((n) => n.map((x) => ({ ...x, unread: false })))}
                      className="text-[11px] font-semibold text-gold hover:underline"
                    >
                      Marcar todas lidas
                    </button>
                  </div>
                  {notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={closeAll}
                      className="flex w-full items-start gap-2.5 border-b border-edge/30 px-4 py-3 text-left transition-colors hover:bg-[#2c1d13]"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread !== false ? 'bg-tang' : 'bg-edge'}`} />
                      <span>
                        <span className="block text-[13px] font-semibold text-white">{n.title}</span>
                        <span className="block text-xs leading-relaxed text-sand">{n.desc}</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wide text-sand/50">{n.time}</span>
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {cartBtn}

          {/* Conta */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setOpenMenu((m) => (m === 'account' ? 'none' : 'account'))}
              className="flex items-center gap-2 rounded-xl border border-edge/60 bg-card/60 py-1 pl-1 pr-2.5 transition-colors hover:border-tang/60"
            >
              <Avatar name={user?.username ?? '?'} size={32} />
              <span className="hidden max-w-[110px] truncate text-sm font-semibold text-white sm:block">
                {user?.username}
              </span>
              <ChevronDown size={15} className={`text-sand transition-transform duration-200 ${openMenu === 'account' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openMenu === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-edge/70 bg-[#24170f] py-1.5 shadow-2xl"
                >
                  <div className="border-b border-edge/40 px-4 pb-2.5 pt-1.5">
                    <p className="font-display text-sm font-bold text-white">{user?.username}</p>
                    <p className="text-[11px] text-sand">Conta MONKEY LARANJA</p>
                  </div>
                  {ACCOUNT_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-cream/90 transition-colors hover:bg-[#2c1d13] hover:text-gold"
                    >
                      <l.icon size={15} className="text-sand" /> {l.label}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-edge/40 pt-1">
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={15} /> Sair da conta
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Busca mobile */}
      <AnimatePresence>
        {openMenu === 'mobile' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-edge/40 md:hidden"
          >
            <form onSubmit={doSearch} className="relative px-4 pt-3">
              <Search size={16} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-sand/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar na loja..."
                className="h-10 w-full rounded-xl border border-edge/70 bg-[#1b120d] pl-10 pr-3 text-sm text-white outline-none placeholder:text-sand/45 focus:border-tang"
              />
            </form>
            <div className="grid grid-cols-2 gap-1 px-3 py-3">
              {ACCOUNT_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={closeAll}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-cream/90 hover:bg-[#2c1d13] hover:text-gold"
                >
                  <l.icon size={15} className="text-sand" /> {l.label}
                </Link>
              ))}
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={15} /> Sair da conta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Linha 2: categorias ── */}
      <div className="border-t border-edge/40 bg-gradient-to-b from-[#1d130c] to-[#17100c]">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-2 no-scrollbar sm:px-6">
          {/* Categorias (dropdown) */}
          <div ref={catRef} className="relative shrink-0">
            <button
              onClick={() => setOpenMenu((m) => (m === 'categories' ? 'none' : 'categories'))}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold transition-colors ${
                openMenu === 'categories' ? 'bg-tang/15 text-gold' : 'text-cream hover:bg-white/5 hover:text-gold'
              }`}
            >
              <LayoutDashboard size={16} /> Categorias
              <ChevronDown size={13} className={`transition-transform ${openMenu === 'categories' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openMenu === 'categories' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 top-11 z-30 w-56 overflow-hidden rounded-2xl border border-edge/70 bg-[#24170f] py-1.5 shadow-2xl"
                >
                  {GAMES.map((g) => (
                    <Link
                      key={g.slug}
                      to={`/loja/categoria/${g.slug}`}
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-cream/90 transition-colors hover:bg-[#2c1d13] hover:text-gold"
                    >
                      <span className="text-base">{g.emoji}</span> {g.name}
                    </Link>
                  ))}
                  <Link
                    to="/loja/catalogo"
                    onClick={closeAll}
                    className="flex items-center gap-2.5 border-t border-edge/40 px-4 py-2 text-[13px] font-semibold text-gold transition-colors hover:bg-[#2c1d13]"
                  >
                    <Tag size={15} /> Ver todos os anúncios
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="mx-1 h-5 w-px shrink-0 bg-edge/60" />

          {NAV_GAMES.map((g) => (
            <Link
              key={g.slug}
              to={`/loja/categoria/${g.slug}`}
              className="shrink-0 rounded-xl px-3 py-2 text-[13px] font-semibold text-sand transition-colors hover:bg-tang/10 hover:text-tang"
            >
              {g.name}
            </Link>
          ))}
          <Link
            to="/loja/categoria/outros"
            className="shrink-0 rounded-xl px-3 py-2 text-[13px] font-semibold text-sand transition-colors hover:bg-tang/10 hover:text-tang"
          >
            Outros jogos
          </Link>

          {/* VENDER */}
          <Link
            to="/loja/vender"
            className="grad-btn ml-auto flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 font-display text-[13px] font-extrabold tracking-wide text-white shadow-[0_10px_24px_-8px_rgba(255,121,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            <Zap size={15} strokeWidth={2.6} /> VENDER
          </Link>
        </div>
      </div>
    </header>
  )
}