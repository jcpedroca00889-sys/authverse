import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Background from './components/Background'
import Monkey, { type MonkeyMood } from './components/Monkey'
import AuthForm from './components/AuthForm'
import StoreProviders from './state/StoreProviders'
import StoreLayout from './components/store/StoreLayout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SellerPage from './pages/SellerPage'
import SellerDashboardPage from './pages/SellerDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import AccountLayout from './pages/account/AccountLayout'
import ProfilePage from './pages/account/ProfilePage'
import PurchasesPage from './pages/account/PurchasesPage'
import SalesPage from './pages/account/SalesPage'
import FavoritesPage from './pages/account/FavoritesPage'
import WalletPage from './pages/account/WalletPage'
import SettingsPage from './pages/account/SettingsPage'
import SupportPage from './pages/account/SupportPage'
import { getCurrentUser, refreshSession } from './lib/mockAuth'
import type { AuthUser } from './lib/mockAuth'
import { initCatalog } from './services/catalog'

/* ── Tela de login/registro (identidade original preservada) ── */
function LoginGate() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [mood, setMood] = useState<MonkeyMood>('welcome')

  const isLogin = mode === 'login'

  // Já logado? Vai direto para a loja
  if (getCurrentUser()) return <Navigate to="/loja" replace />

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-coal font-body text-white">
      <Background />

      <main className="login-main relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-3">
        <div className="relative w-full max-w-md">
          {/* ── Mascote no topo do card ── */}
          <div className="mascot-wrap absolute -top-[72px] left-1/2 z-20 w-32 -translate-x-1/2">
            <Monkey mood={mood} />
          </div>

          {/* ── Card ── */}
          <motion.section
            initial={{ opacity: 0, scale: 0.92, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 17, delay: 0.12 }}
            className="card-shell relative mt-8 overflow-hidden rounded-3xl border border-edge/50 bg-card/90 p-4 shadow-[0_36px_90px_-24px_rgba(0,0,0,0.75),0_0_60px_-18px_rgba(255,121,0,0.4)] sm:p-5"
          >
            {/* Fio de luz no topo */}
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-tang/60 to-transparent" />

            {/* ── Logo ── */}
            <div className="relative">
              <h1 className="text-center font-display text-[28px] font-extrabold leading-none tracking-[0.06em] text-white sm:text-[30px]">
                MONKEY
              </h1>
              <p className="text-gradient-gold mt-0.5 text-center font-display text-[15px] font-bold tracking-[0.5em]">
                LARANJA
              </p>

              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-center text-[13px] text-sand"
              >
                {isLogin ? 'Que bom ter você de volta!' : 'Crie sua conta na selva! 🍌'}
              </motion.p>

              {/* Separador discreto */}
              <div className="mx-auto my-3 h-px w-3/4 bg-gradient-to-r from-transparent via-edge/70 to-transparent" />
            </div>

            {/* ── Formulário ── */}
            <AuthForm
              mode={mode}
              onSwitchMode={() => setMode(isLogin ? 'register' : 'login')}
              onMood={setMood}
              onLogin={(user: AuthUser) => {
                // Autenticado → entra na loja MONKEY LARANJA
                navigate('/loja', { replace: true })
                console.info(`[MONKEY LARANJA] Login bem-sucedido: @${user.username}`)
              }}
            />
          </motion.section>

          {/* ── Rodapé ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-2 text-center text-[11px] font-medium tracking-widest text-sand/50"
          >
            © 2026 MONKEY LARANJA 🍌 Todos os direitos reservados
          </motion.p>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  // Verifica sessão no Supabase ao carregar (sessão persistente)
  useEffect(() => {
    refreshSession()
    initCatalog()
  }, [])

  return (
    <StoreProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginGate />} />

          {/* Loja (protegida por login) */}
          <Route path="/loja" element={<StoreLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalogo" element={<CatalogPage />} />
            <Route path="categoria/:slug" element={<CatalogPage />} />
            <Route path="produto/:id" element={<ProductPage />} />
            <Route path="vendedor/:username" element={<SellerPage />} />
            <Route path="carrinho" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="vender" element={<SellerDashboardPage />} />
            <Route path="conta" element={<AccountLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="compras" element={<PurchasesPage />} />
              <Route path="vendas" element={<SalesPage />} />
              <Route path="favoritos" element={<FavoritesPage />} />
              <Route path="carteira" element={<WalletPage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="suporte" element={<SupportPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProviders>
  )
}