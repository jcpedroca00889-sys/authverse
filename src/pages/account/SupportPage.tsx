import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Lock,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react'
import { useToasts } from '../../state/StoreProviders'

const FAQ = [
  {
    q: 'Como funciona a entrega automática?',
    a: 'Anúncios com o selo ⚡ AUTO entregam o produto (login, código ou item) poucos minutos após a confirmação do pagamento — sem precisar conversar com o vendedor.',
  },
  {
    q: 'E se eu não receber o produto?',
    a: 'Todos os pedidos são cobertos pela proteção ao comprador. Se o vendedor não entregar dentro do prazo, você pode abrir uma disputa e receber o reembolso integral.',
  },
  {
    q: 'Como eu começo a vender?',
    a: 'Acesse "VENDER" no menu, publique seu anúncio com título, fotos/ilustração, preço e descrição. Seu anúncio entra no catálogo na hora e você acompanha as vendas na área do vendedor.',
  },
  {
    q: 'Entrega manual: quanto tempo demora?',
    a: 'O prazo é combinado com o vendedor pelo chat — normalmente entre 30 minutos e 24 horas. Acompanhe o status do pedido em "Minhas compras".',
  },
  {
    q: 'Como funciona o saldo da carteira?',
    a: 'Você pode adicionar saldo e usar para comprar em um clique. Em produção, a carteira será integrada a um gateway de pagamento real (PIX, cartão etc.).',
  },
  {
    q: 'O que acontece se o anúncio estiver errado?',
    a: 'Você pode denunciar o anúncio em até 7 dias após a entrega. Nossa equipe analisa e, confirmado o problema, você recebe o reembolso e o vendedor é avaliado.',
  },
]

const POLICIES = [
  { icon: ShieldCheck, title: 'Compra protegida', desc: 'Seu pagamento só é liberado ao vendedor após a entrega confirmada.' },
  { icon: RotateCcw, title: 'Reembolso', desc: 'Garantia de 7 dias para problemas comprovados de entrega ou anúncio.' },
  { icon: Lock, title: 'Privacidade', desc: 'Seus dados são criptografados e nunca compartilhados sem consentimento.' },
]

export default function SupportPage() {
  const { push } = useToasts()
  const [open, setOpen] = useState<number | null>(0)
  const [form, setForm] = useState({ subject: 'Preciso de ajuda com uma compra', message: '' })

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.message.trim().length < 10) {
      push('error', 'Mensagem muito curta', 'Descreva o motivo com pelo menos 10 caracteres.')
      return
    }
    push('success', 'Chamado aberto! 🎫', 'Nossa equipe responde em até 24h pelo seu e-mail.')
    setForm((f) => ({ ...f, message: '' }))
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-extrabold text-white">Central de suporte</h2>

      {/* Políticas */}
      <div className="grid gap-3 sm:grid-cols-3">
        {POLICIES.map((p) => (
          <div key={p.title} className="rounded-2xl border border-edge/50 bg-card/60 p-4">
            <p.icon size={20} className="text-tang" />
            <h3 className="font-display mt-2 text-sm font-extrabold text-white">{p.title}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-sand">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* FAQ */}
        <section className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
          <h3 className="font-display mb-4 flex items-center gap-2 text-base font-extrabold text-white">
            <LifeBuoy size={17} className="text-tang" /> Perguntas frequentes
          </h3>
          <div className="space-y-2">
            {FAQ.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-edge/40 bg-[#1b120d]/60">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-[13.5px] font-semibold text-white">{f.q}</span>
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-sand transition-transform duration-200 ${open === i ? 'rotate-180 text-gold' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="border-t border-edge/30 px-4 py-3 text-[12.5px] leading-relaxed text-sand">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Contato */}
        <section className="h-fit rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
          <h3 className="font-display mb-4 flex items-center gap-2 text-base font-extrabold text-white">
            <MessageCircle size={17} className="text-tang" /> Falar com a gente
          </h3>
          <form onSubmit={send} className="space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-cream/90">Assunto</span>
              <select
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="h-11 w-full cursor-pointer rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 text-sm text-white outline-none focus:border-tang"
              >
                <option>Preciso de ajuda com uma compra</option>
                <option>Problema com entrega</option>
                <option>Quero vender na plataforma</option>
                <option>Denunciar um anúncio ou vendedor</option>
                <option>Outro assunto</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-cream/90">Mensagem</span>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={5}
                placeholder="Conte o que aconteceu com o máximo de detalhes..."
                className="w-full resize-y rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-sand/40 focus:border-tang"
              />
            </label>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="grad-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[14px] font-extrabold tracking-wide text-white shadow-[0_14px_32px_-10px_rgba(255,121,0,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Send size={16} /> ENVIAR MENSAGEM
            </motion.button>
            <p className="text-center text-[11.5px] text-sand/60">
              Tempo médio de resposta: <b className="text-gold">até 24h</b>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}