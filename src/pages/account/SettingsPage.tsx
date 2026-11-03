import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, BellOff, LogOut, Mail, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearAllLocalData } from '../../services/catalog'
import { useToasts } from '../../state/StoreProviders'
import { logout, getCurrentUser, changePassword } from '../../lib/mockAuth'

interface Settings {
  pushNotifs: boolean
  emailNotifs: boolean
  saleAlerts: boolean
}

const SETTINGS_KEY = 'monkey_settings'
const DEFAULTS: Settings = { pushNotifs: true, emailNotifs: true, saleAlerts: true }

function readSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return DEFAULTS
  }
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { push } = useToasts()
  const user = getCurrentUser()!
  const [settings, setSettings] = useState<Settings>(readSettings)
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const toggle = (key: keyof Settings) => setSettings((s) => ({ ...s, [key]: !s[key] }))

  const Toggles: Array<{ key: keyof Settings; label: string; desc: string }> = [
    { key: 'pushNotifs', label: 'Notificações no navegador', desc: 'Alertas de pedidos, ofertas e mensagens.' },
    { key: 'emailNotifs', label: 'E-mails promocionais', desc: 'Novidades e ofertas exclusivas por e-mail.' },
    { key: 'saleAlerts', label: 'Alertas de venda', desc: 'Avise quando um dos seus anúncios for vendido.' },
  ]

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pass.next.length < 6) return push('error', 'Senha muito curta', 'Use pelo menos 6 caracteres.')
    if (pass.next !== pass.confirm) return push('error', 'As senhas não coincidem')

    const result = await changePassword(pass.current, pass.next)
    if ('error' in result) {
      push('error', 'Erro ao alterar senha', result.error)
      return
    }

    push('success', 'Senha alterada com sucesso! 🎉', 'Use sua nova senha no próximo login.')
    setPass({ current: '', next: '', confirm: '' })
  }

  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-extrabold text-white">Configurações</h2>

      {/* Notificações */}
      <section className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
        <h3 className="font-display mb-4 flex items-center gap-2 text-base font-extrabold text-white">
          {settings.pushNotifs ? <Bell size={17} className="text-tang" /> : <BellOff size={17} className="text-sand" />}
          Notificações
        </h3>
        <div className="space-y-3">
          {Toggles.map((t) => (
            <label key={t.key} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-edge/40 bg-[#1b120d]/60 px-4 py-3 transition-colors hover:border-edge">
              <span>
                <span className="block text-[13.5px] font-semibold text-white">{t.label}</span>
                <span className="block text-[11.5px] text-sand">{t.desc}</span>
              </span>
              <button
                type="button"
                onClick={() => toggle(t.key)}
                aria-pressed={settings[t.key]}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${settings[t.key] ? 'grad-btn' : 'bg-edge/60'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${settings[t.key] ? 'left-[22px]' : 'left-0.5'}`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>

      {/* Senha */}
      <section className="rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
        <h3 className="font-display mb-4 text-base font-extrabold text-white">Alterar senha</h3>
        <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['current', 'Senha atual'],
              ['next', 'Nova senha'],
              ['confirm', 'Confirmar nova senha'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-semibold text-cream/90">{label}</span>
              <input
                type="password"
                value={pass[key]}
                onChange={(e) => setPass((p) => ({ ...p, [key]: e.target.value }))}
                className="h-11 w-full rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang"
                placeholder="••••••••"
              />
            </label>
          ))}
          <div className="sm:col-span-3">
            <button type="submit" className="rounded-xl border border-gold/60 px-6 py-2.5 font-display text-[13px] font-bold text-gold transition-colors hover:bg-gold/10">
              ALTERAR SENHA
            </button>
          </div>
        </form>
      </section>

      {/* Dados demo */}
      <section className="rounded-3xl border border-red-500/25 bg-red-500/5 p-5 sm:p-6">
        <h3 className="font-display mb-1.5 flex items-center gap-2 text-base font-extrabold text-red-300">
          <AlertTriangle size={17} /> Zona de demonstração
        </h3>
        <p className="mb-4 text-[12.5px] leading-relaxed text-sand">
          Seus anúncios, pedidos, favoritos e carteira ficam salvos apenas neste navegador (localStorage).
          Ao limpar, você restaura o estado de demonstração inicial.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => (confirmClear ? (clearAllLocalData(), setConfirmClear(false), push('info', 'Dados demo limpos', 'O catálogo de demonstração foi restaurado.')) : setConfirmClear(true))}
            onMouseLeave={() => setConfirmClear(false)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-display text-[13px] font-bold transition-all ${
              confirmClear
                ? 'border-red-500/60 bg-red-500/15 text-red-300'
                : 'border-red-500/40 text-red-300 hover:bg-red-500/10'
            }`}
          >
            <RefreshCcw size={14} /> {confirmClear ? 'CONFIRMAR LIMPEZA?' : 'LIMPAR DADOS DEMO'}
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl border border-edge/60 px-4 py-2.5 font-display text-[13px] font-bold text-sand transition-colors hover:border-gold hover:text-gold"
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>
      </section>

      {/* Conta */}
      <p className="flex items-center gap-1.5 text-[11.5px] text-sand/60">
        <Mail size={12} /> Logado como <b className="text-sand">@{user.username}</b> — conta salva na tabela do Supabase.
      </p>
    </div>
  )
}