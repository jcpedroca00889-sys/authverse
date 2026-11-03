import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naemdrvjslhiaqvklehv.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_BdLFeFZ_r1Lgz7kix9eIBw_DxLGjnn1'

/**
 * Token da sessão (tabela app_sessions) guardado no navegador.
 * Todas as operações sensíveis recebem este token como parâmetro
 * das RPCs — nenhum header customizado, imune a bloqueio de CORS.
 */
const TOKEN_KEY = 'monkey_token'

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveSessionToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage indisponível (modo privado etc.) — sessão dura só na memória
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)