import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, CreditCard, Loader2, Plus, QrCode, Wallet } from 'lucide-react'
import { useToasts, useWallet } from '../../state/StoreProviders'
import { brl, prettyDate } from '../../lib/format'

const QUICK = [25, 50, 100, 200]

export default function WalletPage() {
  const { balance, transactions, deposit } = useWallet()
  const { push } = useToasts()
  const [amount, setAmount] = useState<number>(50)
  const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [depositing, setDepositing] = useState(false)

  const doDeposit = async () => {
    if (amount <= 0) {
      push('error', 'Valor inválido', 'Escolha um valor acima de zero.')
      return
    }
    setDepositing(true)
    await deposit(amount, method === 'pix' ? 'PIX (simulado)' : 'Cartão (em breve)')
    setDepositing(false)
    push('success', 'Saldo adicionado! 🎉', `${brl(amount)} creditados na sua carteira.`)
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-extrabold text-white">Carteira</h2>

      {/* Saldo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-[#2a1608] via-[#24170f] to-[#1a100a] p-6"
      >
        <div
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,212,59,0.16), transparent 65%)' }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sand/70">
              <Wallet size={13} className="text-gold" /> Saldo disponível
            </p>
            <p className="font-display mt-1.5 text-4xl font-extrabold text-gold">{brl(balance)}</p>
            <p className="mt-1 text-[11.5px] text-sand/60">Saldo inicial demonstrativo: R$ 150,00</p>
          </div>
          <span className="hidden rounded-2xl border border-edge/60 bg-[#1b120d]/80 px-4 py-3 text-center text-[11px] font-semibold leading-relaxed text-sand sm:block">
            💳 Pagamentos reais
            <br />
            chegam com a integração
            <br />
            do gateway (em breve)
          </span>
        </div>
      </motion.div>

      {/* Depósito */}
      <div className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
        <h3 className="font-display mb-4 text-lg font-extrabold text-white">Adicionar saldo</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={`rounded-xl border px-4 py-2 font-display text-sm font-bold transition-all ${
                amount === v ? 'border-tang bg-tang/15 text-tang' : 'border-edge/60 text-sand hover:border-tang/50 hover:text-gold'
              }`}
            >
              R$ {v}
            </button>
          ))}
          <label className="flex items-center gap-2 rounded-xl border border-edge/60 px-4 py-2">
            <span className="text-xs text-sand/70">R$</span>
            <input
              type="number"
              min={1}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-20 bg-transparent text-sm font-bold text-white outline-none"
              placeholder="outro valor"
            />
          </label>
        </div>

        <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
          <button
            onClick={() => setMethod('pix')}
            className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
              method === 'pix' ? 'border-tang bg-tang/10' : 'border-edge/50 bg-[#1b120d]/50 hover:border-edge'
            }`}
          >
            <QrCode size={17} className={method === 'pix' ? 'text-tang' : 'text-sand'} />
            <span>
              <span className="block text-[13px] font-bold text-white">PIX</span>
              <span className="block text-[11px] text-sand">Instantâneo (simulado)</span>
            </span>
          </button>
          <button
            onClick={() => {
              push('info', 'Cartão em breve', 'A integração com o gateway de pagamento está em desenvolvimento.')
            }}
            className="flex cursor-not-allowed items-center gap-2.5 rounded-xl border-2 border-edge/50 bg-[#1b120d]/50 p-3 text-left opacity-50"
          >
            <CreditCard size={17} className="text-sand" />
            <span>
              <span className="block text-[13px] font-bold text-white">Cartão de crédito</span>
              <span className="block text-[11px] text-sand">Em breve</span>
            </span>
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={doDeposit}
          disabled={depositing}
          className="grad-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[15px] font-extrabold tracking-wide text-white shadow-[0_14px_32px_-10px_rgba(255,121,0,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {depositing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {depositing ? 'PROCESSANDO...' : 'ADICIONAR SALDO'}
        </motion.button>
      </div>

      {/* Transações */}
      <div className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
        <h3 className="font-display mb-4 text-lg font-extrabold text-white">Histórico de transações</h3>
        {transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-sand">Nenhuma transação ainda.</p>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3.5 rounded-xl border border-edge/40 bg-[#1b120d]/60 p-3.5">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    t.type === 'credit' ? 'bg-emerald-500/12 text-emerald-400' : 'bg-tang/12 text-tang'
                  }`}
                >
                  {t.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13.5px] font-semibold text-white">{t.description}</p>
                  <p className="text-[11.5px] text-sand/70">
                    {prettyDate(t.date)} • {t.method}
                    {t.demo && <span className="ml-1.5 rounded border border-dashed border-edge/70 px-1.5 text-[10px] uppercase text-sand/50">demo</span>}
                  </p>
                </div>
                <span
                  className={`font-display text-[15px] font-extrabold ${
                    t.type === 'credit' ? 'text-emerald-300' : 'text-tang'
                  }`}
                >
                  {t.type === 'credit' ? '+' : '−'}
                  {brl(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}