import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MessageCircle, Youtube } from 'lucide-react'
import Logo from './Logo'

const COLUMNS = [
  {
    title: 'Institucional',
    links: [
      { label: 'Sobre nós', to: '/loja/conta/suporte' },
      { label: 'Como comprar', to: '/loja/conta/suporte' },
      { label: 'Como vender', to: '/loja/vender' },
      { label: 'Central de ajuda', to: '/loja/conta/suporte' },
    ],
  },
  {
    title: 'Segurança',
    links: [
      { label: 'Segurança', to: '/loja/conta/suporte' },
      { label: 'Política de reembolso', to: '/loja/conta/suporte' },
      { label: 'Termos de uso', to: '/loja/conta/suporte' },
      { label: 'Privacidade', to: '/loja/conta/suporte' },
    ],
  },
  {
    title: 'Acesso rápido',
    links: [
      { label: 'Explorar catálogo', to: '/loja/catalogo' },
      { label: 'Melhores ofertas', to: '/loja/catalogo?sort=price-asc' },
      { label: 'Mais vendidos', to: '/loja/catalogo?sort=best-sellers' },
      { label: 'Anunciar produto', to: '/loja/vender' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-edge/50 bg-gradient-to-b from-[#1d130c] to-[#120c08]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo size="lg" />
            <p className="mt-4 text-sm leading-relaxed text-sand">
              O marketplace gamer da MONKEY LARANJA: contas, itens, moedas e skins com entrega rápida e
              vendedores verificados.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[Instagram, Youtube, Facebook, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge/60 text-sand transition-all hover:-translate-y-0.5 hover:border-tang hover:text-gold"
                  aria-label="Rede social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display mb-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-sand transition-colors hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contato + selos de confiança */}
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-edge/50 bg-[#24170f]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="mailto:suporte@monkeylaranja.com"
            className="flex items-center gap-2 text-sm text-sand transition-colors hover:text-gold"
          >
            <Mail size={15} className="text-tang" /> suporte@monkeylaranja.com
          </a>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-sand/80">
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              🔒 Pagamento seguro
            </span>
            <span className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">
              🛡️ Compra protegida
            </span>
            <span className="rounded-lg border border-tang/30 bg-tang/10 px-2.5 py-1 text-tang">
              ⚡ Entrega automática
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-edge/40 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-sand/70">
            © 2026 MONKEY LARANJA 🍌 Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-sand/50">
            Projeto demonstrativo — produtos, vendedores e estatísticas são fictícios.
          </p>
        </div>
      </div>
    </footer>
  )
}