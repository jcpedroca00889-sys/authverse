import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import type { CartItem, Product, ToastMsg, WalletTransaction } from '../lib/types'
import * as walletService from '../services/wallet'
import { getCurrentUser } from '../lib/mockAuth'
import {
  fetchFavorites as sbFetchFavorites,
  addFavorite,
  removeFavorite,
} from '../services/catalog'

/* ── Toasts ────────────────────────────────────────────────── */

interface ToastCtx {
  push: (type: ToastMsg['type'], title: string, message?: string) => void
}
const ToastContext = createContext<ToastCtx | null>(null)
export const useToasts = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToasts deve ser usado dentro de StoreProviders')
  return ctx
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([])
  const idRef = useRef(0)

  const push = useCallback<ToastCtx['push']>((type, title, message) => {
    const id = ++idRef.current
    setItems((prev) => [...prev.slice(-3), { id, type, title, message }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle2 size={19} className="shrink-0 text-emerald-400" />,
    error: <AlertCircle size={19} className="shrink-0 text-red-400" />,
    info: <Info size={19} className="shrink-0 text-tang" />,
  }
  const border = { success: 'border-emerald-500/40', error: 'border-red-500/40', info: 'border-tang/40' }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.button
              key={t.id}
              onClick={() => remove(t.id)}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-2xl border ${border[t.type]} bg-[#24170f]/95 px-4 py-3 text-left shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur`}
            >
              {icons[t.type]}
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-white">{t.title}</span>
                {t.message && <span className="mt-0.5 block text-xs leading-relaxed text-sand">{t.message}</span>}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

/* ── Carrinho (persistente) ────────────────────────────────── */

interface CartCtx {
  items: CartItem[]
  add: (product: Product, qty?: number, variantName?: string) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
  count: number
  subtotal: number
}
const CartContext = createContext<CartCtx | null>(null)
export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de StoreProviders')
  return ctx
}

const CART_KEY = 'monkey_cart'

/* ── Favoritos (persistente) ───────────────────────────────── */

interface FavsCtx {
  ids: string[]
  has: (id: string) => boolean
  toggle: (id: string) => void
}
const FavsContext = createContext<FavsCtx | null>(null)
export const useFavorites = () => {
  const ctx = useContext(FavsContext)
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de StoreProviders')
  return ctx
}

const FAVS_KEY = 'monkey_favs'

/* ── Carteira ──────────────────────────────────────────────── */

interface WalletCtx {
  balance: number
  transactions: WalletTransaction[]
  loading: boolean
  refresh: () => Promise<void>
  deposit: (amount: number, method: string) => Promise<boolean>
  pay: (amount: number, description: string) => Promise<boolean>
}
const WalletContext = createContext<WalletCtx | null>(null)
export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet deve ser usado dentro de StoreProviders')
  return ctx
}

/* ── Provider raiz ─────────────────────────────────────────── */

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((product: Product, qty = 1, variantName?: string) => {
    // Determina o preço baseado na variante
    let unitPrice = product.price
    if (variantName && product.variants) {
      const v = product.variants.find((x) => x.name === variantName)
      if (v) unitPrice = v.price
    }
    setItems((prev) => {
      // Chave única: product.id + variantName
      const key = variantName ? `${product.id}::${variantName}` : product.id
      const existing = prev.find((i) => {
        const iKey = i.variantName ? `${i.product.id}::${i.variantName}` : i.product.id
        return iKey === key
      })
      if (existing) {
        return prev.map((i) => {
          const iKey = i.variantName ? `${i.product.id}::${i.variantName}` : i.product.id
          return iKey === key ? { ...i, qty: Math.min(99, i.qty + qty), unitPrice } : i
        })
      }
      return [...prev, { product, qty, variantName, unitPrice }]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, qty: Math.min(99, qty) } : i)),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + (i.unitPrice ?? i.product.price) * i.qty, 0),
    [items],
  )

  const value = useMemo(
    () => ({ items, add, remove, setQty, clear, count, subtotal }),
    [items, add, remove, setQty, clear, count, subtotal],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])

  // Carrega favoritos do Supabase ao montar
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      sbFetchFavorites(user.username).then(setIds)
    }
  }, [])

  const has = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback((id: string) => {
    const user = getCurrentUser()
    if (!user) return
    setIds((prev) => {
      if (prev.includes(id)) {
        removeFavorite(user.username, id).catch(console.warn)
        return prev.filter((x) => x !== id)
      } else {
        addFavorite(user.username, id).catch(console.warn)
        return [...prev, id]
      }
    })
  }, [])

  return <FavsContext.Provider value={{ ids, has, toggle }}>{children}</FavsContext.Provider>
}

function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const state = await walletService.fetchWallet()
    setBalance(state.balance)
    setTransactions(state.transactions)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const deposit = useCallback(async (amount: number, method: string) => {
    const state = await walletService.addFunds(amount, method)
    setBalance(state.balance)
    setTransactions(state.transactions)
    return true
  }, [])

  const pay = useCallback(async (amount: number, description: string) => {
    const state = await walletService.spend(amount, description)
    if (!state) return false
    setBalance(state.balance)
    setTransactions(state.transactions)
    return true
  }, [])

  const value = useMemo(
    () => ({ balance, transactions, loading, refresh, deposit, pay }),
    [balance, transactions, loading, refresh, deposit, pay],
  )
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export default function StoreProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <FavoritesProvider>
          <WalletProvider>{children}</WalletProvider>
        </FavoritesProvider>
      </CartProvider>
    </ToastProvider>
  )
}