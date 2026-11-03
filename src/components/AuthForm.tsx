import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  User,
  UserPlus,
} from 'lucide-react'
import { login as apiLogin, logout, register as apiRegister, getCurrentUser } from '../lib/mockAuth'
import type { AuthResult } from '../lib/mockAuth'
import type { AuthUser } from '../lib/mockAuth'
import type { MonkeyMood } from './Monkey'

type Mode = 'login' | 'register'
type Focus = 'none' | 'username' | 'password'

interface AuthFormProps {
  mode: Mode
  onSwitchMode: () => void
  onMood: (m: MonkeyMood) => void
  onLogin: (user: AuthUser) => void
}

/* ── Explosão de partículas no clique do botão ─────────────── */
function Burst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return {
          x: Math.cos(a) * (30 + (i % 3) * 14),
          y: Math.sin(a) * (30 + (i % 3) * 14),
          s: 4 + (i % 3) * 3,
          c: i % 2 ? '#FFD43B' : '#FFF0D9',
        }
      }),
    [],
  )
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: p.s, height: p.s, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </span>
  )
}

/* ── Confete na tela de sucesso ────────────────────────────── */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: 26 + (i * 11) % 48,
        delay: i * 0.06,
        dur: 1.6 + (i % 4) * 0.28,
        rot: (i * 47) % 360,
        color: ['#FFD43B', '#FF9500', '#FF7900', '#FFF0D9'][i % 4],
        size: 6 + (i % 3) * 3,
      })),
    [],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{ left: `${p.left}%`, top: -12, width: p.size, height: p.size, background: p.color }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 300, rotate: p.rot + 360, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

/* ── Campo com ícone ───────────────────────────────────────── */
interface FieldProps {
  id: string
  label: string
  icon: React.ReactNode
  type: 'text' | 'password'
  placeholder: string
  value: string
  error?: string
  autoComplete: string
  rightAction?: React.ReactNode
  onFocus?: () => void
  onBlur?: () => void
  onChange: (value: string) => void
}

function Field({ id, label, icon, type, placeholder, value, error, autoComplete, rightAction, onFocus, onBlur, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-cream/90">
        {label}
      </label>
      <div className={`field-wrap ${error ? 'field-wrap--error' : ''}`}>
        <span className="text-ember transition-colors duration-200 [.field-wrap:focus-within_&]:text-tang">{icon}</span>
        <input
          id={id}
          className="w-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-sand/50"
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {rightAction}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-400"
          >
            <AlertCircle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Formulário principal ──────────────────────────────────── */
export default function AuthForm({ mode, onSwitchMode, onMood, onLogin }: AuthFormProps) {
  const isLogin = mode === 'login'

  const [values, setValues] = useState({ username: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [errCount, setErrCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(getCurrentUser)
  const [focus, setFocus] = useState<Focus>('none')
  const [burstKey, setBurstKey] = useState(0)
  const loginTimer = useRef<number | null>(null)

  // O mascote reage ao que o usuário faz
  useEffect(() => {
    if (user) onMood('celebrate')
    else if (focus === 'password') onMood('hideEyes')
    else if (focus === 'username') onMood('lookUser')
    else onMood('idle')
  }, [focus, user, onMood])

  // Ao trocar entre login/registro, limpa mensagens da tentativa anterior
  useEffect(() => {
    setFormError('')
    setNotice('')
    setErrors({})
  }, [mode])

  const handleChange = (field: 'username' | 'password' | 'confirm') => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setFormError('')
    setNotice('')
  }

  const validate = () => {
    const err: typeof errors = {}
    if (values.username.trim().length < 3) {
      err.username = 'Use pelo menos 3 caracteres.'
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(values.username.trim())) {
      err.username = 'Só letras, números, ponto, traço e _.'
    }
    if (values.password.length < 6) {
      err.password = 'A senha precisa de 6+ caracteres.'
    }
    if (!isLogin && values.confirm !== values.password) {
      err.confirm = 'As senhas não coincidem.'
    }
    return err
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    setErrors(err)
    if (Object.keys(err).length > 0) {
      setErrCount((c) => c + 1)
      return
    }

    setLoading(true)
    setFormError('')
    setNotice('')
    setBurstKey((k) => k + 1)

    await new Promise((r) => setTimeout(r, 850))

    try {
      const result = isLogin
        ? await apiLogin({ username: values.username.trim(), password: values.password })
        : await apiRegister({ username: values.username.trim(), password: values.password })

      setLoading(false)
      if ('error' in result) {
        setFormError(result.error)
        setErrCount((c) => c + 1)
        return
      }
      // Conta criada, mas o Supabase exige confirmação por email antes do login
      if ('pendingConfirmation' in result) {
        setNotice(
          `Conta criada! Confirme o email de ${result.pendingConfirmation.email} para poder entrar. 📬`,
        )
        setValues({ username: '', password: '', confirm: '' })
        return
      }
      setUser(result.user)
      // Mostra a comemoração do mascote
      loginTimer.current = window.setTimeout(() => onLogin(result.user), 950)
    } catch (err) {
      setLoading(false)
      setFormError('Erro de conexão com o servidor. Verifique sua internet e tente novamente. 🍌')
      console.error('[MONKEY LARANJA] Erro na autenticação:', err)
    }
  }

  const handleSignOut = () => {
    if (loginTimer.current) {
      clearTimeout(loginTimer.current)
      loginTimer.current = null
    }
    logout()
    setUser(null)
    setValues({ username: '', password: '', confirm: '' })
    setFocus('none')
  }

  // Limpa o timer de login se o componente desmontar antes
  useEffect(() => {
    return () => {
      if (loginTimer.current) clearTimeout(loginTimer.current)
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      {user ? (
        /* ── Logado ── */
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-edge/50 bg-[#1b120d]/60 px-6 py-6 text-center"
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0.3, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.05 }}
          >
            <CheckCircle2 size={44} className="mx-auto text-[#4ade80]" />
          </motion.div>
          <h2 className="font-display mt-2.5 text-lg font-extrabold text-white">
            {isLogin ? 'Login realizado!' : 'Conta criada!'} 🎉
          </h2>
          <p className="mt-1 text-sm text-sand">
            Bem-vindo(a) à selva, <span className="font-bold text-gold">@{user.username}</span>!
          </p>
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-edge/70 py-2.5 font-display text-sm font-bold tracking-[0.15em] text-sand transition-all duration-200 hover:border-gold hover:bg-gold/10 hover:text-gold active:scale-[0.98]"
          >
            <LogOut size={17} /> SAIR
          </button>
        </motion.div>
      ) : (
        /* ── Formulário ── */
        <motion.form
          key={mode}
          initial={{ opacity: 0, x: isLogin ? -22 : 22 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 22 : -22 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-3"
        >
          {/* Erro geral (treme a cada tentativa errada) */}
          <motion.div
            key={errCount}
            animate={errCount ? { x: [0, -9, 9, -7, 7, -4, 4, 0] } : undefined}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence>
              {formError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300"
                >
                  <AlertCircle size={15} /> {formError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Aviso (ex.: confirmação de email pendente) */}
          <AnimatePresence>
            {notice && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold"
              >
                <Mail size={15} /> {notice}
              </motion.p>
            )}
          </AnimatePresence>

          <Field
            id="username"
            label="Usuário"
            icon={<User size={19} />}
            type="text"
            placeholder="Digite seu username"
            value={values.username}
            error={errors.username}
            autoComplete="username"
            onChange={handleChange('username')}
            onFocus={() => setFocus('username')}
            onBlur={() => setFocus('none')}
          />

          <Field
            id="password"
            label="Senha"
            icon={<Lock size={19} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha"
            value={values.password}
            error={errors.password}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            onChange={handleChange('password')}
            onFocus={() => setFocus('password')}
            onBlur={() => setFocus('none')}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-sand/70 transition-colors hover:text-gold"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            }
          />

          {!isLogin && (
            <Field
              id="confirm"
              label="Confirmar senha"
              icon={<Lock size={19} />}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita sua senha"
              value={values.confirm}
              error={errors.confirm}
              autoComplete="new-password"
              onChange={handleChange('confirm')}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus('none')}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="text-sand/70 transition-colors hover:text-gold"
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              }
            />
          )}

          {isLogin && (
            <div className="-mt-1 text-right">
              <button type="button" className="text-[13px] font-semibold text-gold transition hover:underline">
                Esqueceu sua senha?
              </button>
            </div>
          )}

          {/* Botão principal com partículas */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            className="grad-btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-2.5 font-display text-[15px] font-bold tracking-[0.12em] text-white shadow-[0_12px_28px_-10px_rgba(255,121,0,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(255,149,0,0.6)] hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {burstKey > 0 && <Burst key={burstKey} />}
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isLogin ? 'ENTRANDO...' : 'CRIANDO CONTA...'}
              </>
            ) : isLogin ? (
              <>
                <LogIn size={20} /> ENTRAR NA CONTA
              </>
            ) : (
              <>
                <UserPlus size={20} /> CRIAR CONTA
              </>
            )}
          </motion.button>

          {/* Divisor discreto */}
          <div className="my-0.5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-edge/70" />
            <span className="text-xs font-medium uppercase tracking-widest text-sand/50">ou</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-edge/70" />
          </div>

          {/* Troca de modo */}
          <div className="text-center">
            <p className="mb-1.5 text-sm text-sand">
              {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              type="button"
              onClick={onSwitchMode}
              className="w-full rounded-2xl border-2 border-edge/70 py-2.5 font-display text-sm font-bold tracking-[0.12em] text-gold transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 active:translate-y-0"
            >
              {isLogin ? 'CRIAR CONTA' : 'ENTRAR'}
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}