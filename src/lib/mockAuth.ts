/**
 * Autenticação via tabela própria no Postgres (app_users/app_sessions).
 *
 * Este módulo substitui o Supabase Auth: o usuário registra/loga através
 * de RPCs SECURITY DEFINER, que validam a senha com bcrypt (pgcrypto)
 * e devolvem um token de sessão. Nenhum email é enviado — fim do erro
 * 429 "email rate limit exceeded".
 *
 * ⚠️ Senhas nunca saem do Postgres em claro e o hash nunca chega ao
 * navegador (RLS bloqueia SELECT direto na tabela app_users).
 *
 * Requer rodar `supabase/08-app-users.sql` no SQL Editor do Supabase.
 */

import { supabase, getSessionToken, saveSessionToken } from './supabase'

export interface AuthUser {
  username: string
}

export type AuthResult = { user: AuthUser } | { error: string }

const SESSION_KEY = 'monkey_session'

interface RpcErrorLike {
  message?: string
  code?: string
}

const MIGRATION_HINT =
  'A autenticação por tabela ainda não está ativa no projeto. ' +
  'Rode supabase/08-app-users.sql no SQL Editor do Supabase. 🐒'

/** Traduz o erro das RPCs em uma mensagem amigável. */
function describeAuthError(error: RpcErrorLike | null, fallback: string): string {
  if (!error) return fallback
  const raw = (error.message ?? '').toUpperCase()
  const code = error.code ?? ''

  if (raw.includes('USERNAME_TAKEN') || code === '23505') {
    return 'Este usuário já está registrado. Tente entrar na conta. 🐒'
  }
  if (raw.includes('WRONG_PASSWORD')) {
    return 'Senha atual incorreta. 🍌'
  }
  if (raw.includes('USERNAME_INVALID')) {
    return 'Nome de usuário inválido: 3 a 24 caracteres, só letras, números, ponto, traço e _.'
  }
  if (raw.includes('PASSWORD_TOO_SHORT')) {
    return 'A senha precisa de 6+ caracteres.'
  }
  if (raw.includes('INVALID_CREDENTIALS')) {
    return 'Usuário ou senha incorretos. 🍌'
  }
  if (raw.includes('TOO_MANY_ATTEMPTS')) {
    return 'Muitas tentativas seguidas. Aguarde 2 minutos e tente de novo. 🐒'
  }
  if (raw.includes('NOT_AUTHENTICATED')) {
    return 'Sua sessão expirou. Entre novamente. 🔑'
  }
  if (raw.includes('ORDER_EMPTY')) {
    return 'O carrinho está vazio. Volte e escolha um item. 🛒'
  }
  if (raw.includes('INVALID_PRODUCT')) {
    return 'Dados do anúncio incompletos. Preencha título e preço.'
  }
  if (raw.includes('INVALID_AMOUNT')) {
    return 'Valor inválido para esta operação.'
  }
  if (code === 'PGRST202' || raw.includes('COULD NOT FIND THE FUNCTION') || raw.includes('PGRST116')) {
    return MIGRATION_HINT
  }
  if (raw.includes('FAILED TO FETCH') || raw.includes('NETWORKERROR') || raw.includes('TYPEERROR')) {
    return 'Não foi possível falar com o servidor. Verifique sua internet e tente novamente. 🍌'
  }
  return fallback
}

function persistSession(token: string, username: string): AuthUser {
  saveSessionToken(token)
  const user: AuthUser = { username }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

function clearStoredSession(): void {
  saveSessionToken(null)
  localStorage.removeItem(SESSION_KEY)
}

export async function register({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<AuthResult> {
  const { data, error } = await supabase.rpc('app_register', {
    p_username: username.trim(),
    p_password: password,
  })

  if (error) {
    return { error: describeAuthError(error, `Erro ao criar conta: ${error.message}`) }
  }

  const payload = data as { token?: string; username?: string } | null
  if (!payload?.token || !payload.username) {
    return { error: 'Resposta inesperada do servidor. Tente novamente. 🍌' }
  }

  return { user: persistSession(payload.token, payload.username) }
}

export async function login({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<AuthResult> {
  const { data, error } = await supabase.rpc('app_login', {
    p_username: username.trim(),
    p_password: password,
  })

  if (error) {
    return { error: describeAuthError(error, 'Não foi possível entrar. Tente novamente. 🍌') }
  }

  const payload = data as { token?: string; username?: string } | null
  if (!payload?.token || !payload.username) {
    return { error: 'Resposta inesperada do servidor. Tente novamente. 🍌' }
  }

  return { user: persistSession(payload.token, payload.username) }
}

export function logout() {
  const token = getSessionToken()
  clearStoredSession()
  // Fire-and-forget: invalida a sessão no banco em segundo plano
  if (token) {
    supabase.rpc('app_logout', { p_token: token }).then(
      () => {},
      () => {},
    )
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

/* ── Perfil e senha (RPCs da tabela app_users) ─────────────── */

export interface ProfileInfo {
  username: string
  displayName: string
  createdAt: string | null
  lastLoginAt: string | null
}

/** Busca o perfil (data de criação etc.) direto da tabela app_users. */
export async function getProfile(): Promise<ProfileInfo | null> {
  const token = getSessionToken()
  if (!token) return null

  const { data, error } = await supabase.rpc('app_me', { p_token: token })
  if (error || !data?.username) return null

  return {
    username: data.username,
    displayName: data.display_name ?? '',
    createdAt: data.created_at ?? null,
    lastLoginAt: data.last_login_at ?? null,
  }
}

export type ChangePasswordResult = { ok: true } | { error: string }

/** Troca a senha validando a atual (RPC SECURITY DEFINER, bcrypt no Postgres). */
export async function changePassword(current: string, next: string): Promise<ChangePasswordResult> {
  const token = getSessionToken()
  if (!token) return { error: 'Sua sessão expirou. Entre novamente. 🔑' }

  const { error } = await supabase.rpc('app_change_password', {
    p_token: token,
    p_current: current,
    p_new: next,
  })
  if (error) return { error: describeAuthError(error, `Erro ao alterar senha: ${error.message}`) }
  return { ok: true }
}

/**
 * Valida o token guardado contra o banco (RPC app_me).
 * Deve ser chamada na inicialização do app para sessões persistentes.
 */
export async function refreshSession(): Promise<AuthUser | null> {
  const token = getSessionToken()
  if (!token) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }

  const { data, error } = await supabase.rpc('app_me', { p_token: token })
  if (error) {
    // Token inválido/vencido ou SQL ainda não aplicado → desloga
    clearStoredSession()
    return null
  }

  const payload = data as { username?: string } | null
  if (!payload?.username) {
    clearStoredSession()
    return null
  }

  return persistSession(token, payload.username)
}