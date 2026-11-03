import { supabase, getSessionToken } from '../lib/supabase'
import type { WalletTransaction } from '../lib/types'

interface WalletState {
  balance: number
  transactions: WalletTransaction[]
}

/* ── Helpers ──────────────────────────────────────────────── */

function mapTx(row: any): WalletTransaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description ?? '',
    date: row.date,
    method: row.method ?? '',
    demo: row.demo ?? false,
  }
}

function mapWallet(data: any): WalletState {
  const txs = Array.isArray(data?.transactions) ? data.transactions : []
  return {
    balance: Number(data?.balance ?? 0),
    transactions: txs.map(mapTx),
  }
}

const EMPTY: WalletState = { balance: 0, transactions: [] }

function getToken(): string | null {
  return getSessionToken()
}

/* ── API pública (via RPCs SECURITY DEFINER — token como parâmetro) ── */

export async function fetchWallet(): Promise<WalletState> {
  const token = getToken()
  if (!token) return EMPTY

  const { data, error } = await supabase.rpc('wallet_get', { p_token: token })
  if (error) {
    console.warn('[MONKEY] wallet_get:', error.message)
    return EMPTY
  }
  return mapWallet(data)
}

export async function addFunds(amount: number, method: string): Promise<WalletState> {
  const token = getToken()
  if (!token) return EMPTY

  const { data, error } = await supabase.rpc('wallet_add', {
    p_token: token,
    p_amount: amount,
    p_method: method,
  })
  if (error) {
    console.warn('[MONKEY] wallet_add:', error.message)
    return EMPTY
  }
  return mapWallet(data)
}

/** Retorna null se o saldo for insuficiente. */
export async function spend(amount: number, description: string): Promise<WalletState | null> {
  const token = getToken()
  if (!token) return null

  const { data, error } = await supabase.rpc('wallet_spend', {
    p_token: token,
    p_amount: amount,
    p_description: description,
  })
  if (error) {
    console.warn('[MONKEY] wallet_spend:', error.message)
    return null
  }
  if (data === null || data === undefined) return null // saldo insuficiente
  return mapWallet(data)
}