import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Landmark,
  Loader2,
  PartyPopper,
  QrCode,
  Wallet,
} from 'lucide-react'
import GameArt from '../components/store/GameArt'
import { gameBySlug } from '../data/catalog'
import { brl, digitsOnly, isValidCpf, maskCpf } from '../lib/format'
import { getCurrentUser } from '../lib/mockAuth'
import { paymentGateway, placeOrder, type PlaceOrderInput } from '../services/catalog'
import { useCart, useToasts, useWallet } from '../state/StoreProviders'
import type { Order } from '../lib/types'

type Method = 'wallet' | 'pix' | 'card' | 'boleto'

const METHODS: Array<{ id: Method; label: string; desc: string; icon: typeof Wallet; disabled?: boolean }> = [
  { id: 'wallet', label: 'Saldo da carteira', desc: 'Use seu saldo MONKEY LARANJA', icon: Wallet },
  { id: 'pix', label: 'PIX', desc: 'Pagamento instantâneo (simulado)', icon: QrCode },
  { id: 'card', label: 'Cartão de crédito', desc: 'Em breve — gateway em integração', icon: CreditCard, disabled: true },
  { id: 'boleto', label: 'Boleto bancário', desc: 'Em breve — gateway em integração', icon: Landmark, disabled: true },
]

/* Confete leve da confirmação */
function ConfettiBits() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: 8 + ((i * 17) % 84),
        delay: i * 0.07,
        dur: 1.4 + (i % 4) * 0.25,
        rot: (i * 53) % 360,
        color: ['#FFD43B', '#FF9500', '#FF7900', '#FFF0D9'][i % 4],
        size: 5 + (i % 3) * 3,
      })),
    [],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{ left: `${p.left}%`, top: -10, width: p.size, height: p.size, background: p.color }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 340, rotate: p.rot + 360, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const { balance, pay } = useWallet()
  const { push } = useToasts()
  const navigate = useNavigate()
  const user = getCurrentUser()

  const [name, setName] = useState(user?.username ?? '')
  const [cpf, setCpf] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [method, setMethod] = useState<Method>('wallet')
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  const total = subtotal

  /* Checkout vazio → volta ao carrinho */
  if (items.length === 0 && !order) {
    return <Navigate to="/loja/carrinho" replace />
  }

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 3) return push('error', 'Preencha seu nome completo')
    if (!isValidCpf(cpf)) return push('error', 'Informe um CPF válido')

    const methodInfo = METHODS.find((m) => m.id === method)!
    if (method === 'wallet' && balance < total) {
      push('error', 'Saldo insuficiente', 'Adicione saldo na sua carteira ou escolha outro método.')
      return
    }

    setProcessing(true)
    const itemsForOrder: PlaceOrderInput['items'] = items.map((i) => ({
      productId: i.product.id,
      title: `${i.product.title}${i.variantName ? ` (${i.variantName})` : ''}`,
      game: i.product.game,
      price: i.unitPrice ?? i.product.price,
      qty: i.qty,
      delivery: i.product.delivery,
      variantName: i.variantName,
    }))

    try {
      // 1) Autorização (mock hoje — gateway real na integração futura)
      if (method === 'wallet') {
        const ok = await pay(total, `Compra de ${items.length} item(ns) na loja`)
        if (!ok) {
          push('error', 'Saldo insuficiente', 'Adicione saldo ou escolha outro método.')
          return
        }
      } else {
        await paymentGateway.charge({ amount: total, method: methodInfo.label })
      }

      // 2) Registra o pedido
      const newOrder = await placeOrder({
        buyer: user?.username ?? 'visitante',
        buyerName: name.trim(),
        buyerCpf: digitsOnly(cpf),
        items: itemsForOrder,
        subtotal,
        discount: 0,
        total,
        paymentMethod: methodInfo.label,
        gateway: method === 'wallet' ? 'saldo' : 'mock',
      })
      setOrder(newOrder)
      clear()
      push('success', 'Compra realizada! 🎉', `Pedido ${newOrder.code} confirmado.`)
    } catch {
      push('error', 'Falha no pagamento', 'Tente novamente em instantes.')
    } finally {
      setProcessing(false)
    }
  }

  /* ── Tela de sucesso ── */
  if (order) {
    const auto = order.items.every((i) => i.delivery === 'automatic')
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-card/70 p-8 text-center"
        >
          <ConfettiBits />
          <motion.div
            initial={{ scale: 0.3, rotate: -24 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 13, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15"
          >
            <CheckCircle2 size={36} className="text-emerald-400" />
          </motion.div>
          <h1 className="font-display mt-4 text-2xl font-extrabold text-white">Pedido confirmado! 🎉</h1>
          <p className="mt-1 text-sm text-sand">
            Ingressou para {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} via <b className="text-gold">{order.paymentMethod}</b>
          </p>

          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-edge/50 bg-[#1b120d]/80 p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sand">Código do pedido</span>
              <span className="font-display text-sm font-extrabold text-gold">{order.code}</span>
            </div>
            <div className="mt-2 border-t border-edge/40 pt-2">
              {order.items.map((i) => (
                <div key={i.productId} className="flex items-center justify-between py-1 text-[13px]">
                  <span className="line-clamp-1 max-w-[70%] text-sand">{i.qty}x {i.title}</span>
                  <span className="font-semibold text-cream">{brl(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-edge/40 pt-2 font-display text-[15px] font-extrabold">
                <span className="text-white">Total</span>
                <span className="text-tang">{brl(order.total)}</span>
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-semibold ${auto ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gold/10 text-gold'}`}>
              {auto ? '⚡ Entrega automática: o vendedor já foi notificado e a entrega sai em minutos.' : '🕐 Entrega manual: acompanhe o status em "Minhas compras".'}
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link to="/loja/conta/compras" className="grad-btn rounded-xl px-6 py-3 font-display text-sm font-bold text-white">
              VER MINHAS COMPRAS
            </Link>
            <Link to="/loja" className="rounded-xl border-2 border-edge/60 px-6 py-3 font-display text-sm font-bold text-sand transition hover:border-gold hover:text-gold">
              VOLTAR À LOJA
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Checkout ── */
  return (
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-5 sm:px-6">
      <div className="mb-5 flex items-center gap-2">
        <Link to="/loja/carrinho" className="flex items-center gap-1.5 text-[13px] font-semibold text-sand transition-colors hover:text-gold">
          <ArrowLeft size={15} /> Voltar ao carrinho
        </Link>
      </div>
      <h1 className="font-display mb-6 text-2xl font-extrabold text-white sm:text-3xl">Checkout</h1>

      {/* Passos */}
      <div className="mb-6 flex items-center gap-2 text-[12px] font-bold">
        <span className="flex items-center gap-1.5 text-gold">
          <span className="grad-btn flex h-6 w-6 items-center justify-center rounded-full text-[11px] text-white">1</span> Dados
        </span>
        <ChevronRight size={13} className="text-edge" />
        <span className="flex items-center gap-1.5 text-gold">
          <span className="grad-btn flex h-6 w-6 items-center justify-center rounded-full text-[11px] text-white">2</span> Pagamento
        </span>
        <ChevronRight size={13} className="text-edge" />
        <span className="flex items-center gap-1.5 text-sand/60">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-edge/60 text-[11px]">3</span> Confirmação
        </span>
      </div>

      <form onSubmit={confirm} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Dados da compra */}
          <section className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
            <h2 className="font-display mb-4 text-lg font-extrabold text-white">Dados da compra</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-cream/90">Nome completo *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-11 w-full rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-cream/90">CPF *</span>
                <input
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  aria-invalid={cpf.length > 0 && !isValidCpf(cpf)}
                  className="h-11 w-full rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang"
                />
                <span className="mt-1 block text-[11px] text-sand/60">
                  Usado só na emissão do pedido — não é exibido ao vendedor.
                </span>
              </label>
            </div>
            <p className="mt-3 rounded-xl border border-sky-500/25 bg-sky-500/8 px-3.5 py-2.5 text-[12px] leading-relaxed text-sky-200/85">
              💡 Comprador: <b className="text-white">@{user?.username}</b>. Nome e CPF são usados apenas para identificar o pedido; os dados de entrega são combinados com o vendedor pelo chat após a compra.
            </p>
          </section>

          {/* Pagamento */}
          <section className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
            <h2 className="font-display mb-1 text-lg font-extrabold text-white">Método de pagamento</h2>
            <p className="mb-4 text-xs text-sand">Saldo disponível: <b className="text-gold">{brl(balance)}</b></p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={m.disabled}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${
                    method === m.id
                      ? 'border-tang bg-tang/10 shadow-[0_0_0_3px_rgba(255,149,0,0.12)]'
                      : 'border-edge/50 bg-[#1b120d]/60 hover:border-edge'
                  } ${m.disabled ? 'cursor-not-allowed opacity-45' : ''}`}
                >
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${method === m.id ? 'grad-btn text-white' : 'bg-[#24170f] text-sand'}`}>
                    <m.icon size={17} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold text-white">{m.label}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-sand">{m.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            {method === 'pix' && (
              <div className="mt-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 text-[12.5px] text-emerald-100/90">
                <p className="mb-1.5 flex items-center gap-1.5 font-bold text-emerald-300"><QrCode size={14} /> PIX (simulado)</p>
                Este é um ambiente demonstrativo: o QR Code e a confirmação serão gerados pelo gateway real na integração futura.
              </div>
            )}
            {method === 'wallet' && balance < total && (
              <div className="mt-3.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12px] font-medium text-red-300">
                Saldo insuficiente. <Link to="/loja/conta/carteira" className="underline">Adicione saldo</Link> ou escolha outro método.
              </div>
            )}
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12px] text-sand">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#ff9500]"
              />
              Li e aceito os termos de uso e a política de reembolso da MONKEY LARANJA.
            </label>
          </section>
        </div>

        {/* Resumo */}
        <div className="h-fit rounded-3xl border border-edge/50 bg-card/60 p-5 lg:sticky lg:top-36">
          <h2 className="font-display mb-4 text-lg font-extrabold text-white">Resumo do pedido</h2>
          <div className="space-y-3.5">
            {items.map(({ product, qty, variantName, unitPrice }) => {
              const displayPrice = unitPrice ?? product.price
              return (
                <div key={product.id + (variantName ?? '')} className="flex gap-3">
                  <div className="h-14 w-[68px] shrink-0 overflow-hidden rounded-lg">
                    <GameArt game={product.game} emoji={product.emoji} variant={product.art} className="h-full w-full" emojiSize={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13px] font-semibold text-white">{product.title}</p>
                    {variantName && <p className="text-[11px] font-bold text-tang">{variantName}</p>}
                    <p className="text-[11px] text-sand/70">{gameBySlug(product.game).name} • {qty}x {brl(displayPrice)}</p>
                  </div>
                  <span className="font-display shrink-0 text-[13px] font-bold text-tang">{brl(displayPrice * qty)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 space-y-2 border-t border-edge/40 pt-4 text-sm">
            <div className="flex justify-between text-sand">
              <span>Subtotal</span>
              <span className="font-semibold text-cream">{brl(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sand">
              <span>Taxa da plataforma</span>
              <span className="text-emerald-300">Grátis</span>
            </div>
            <div className="flex justify-between border-t border-edge/40 pt-2.5 font-display text-lg font-extrabold">
              <span className="text-white">Total</span>
              <span className="text-tang">{brl(total)}</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={processing || !acceptTerms}
            type="submit"
            className="grad-btn mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[15px] font-extrabold tracking-wide text-white shadow-[0_16px_36px_-12px_rgba(255,121,0,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> PROCESSANDO...
              </>
            ) : (
              <>
                <PartyPopper size={18} /> CONFIRMAR COMPRA
              </>
            )}
          </motion.button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-sand/60">
            🔒 Ambiente seguro — nenhum dado financeiro é armazenado nesta demonstração.
          </p>
        </div>
      </form>
    </div>
  )
}