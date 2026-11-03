/**
 * Cliente mínimo do Supabase (PostgREST) para o backend.
 *
 * A autenticação do AUTHVERSE é feita por RPCs SECURITY DEFINER na tabela
 * `app_users` (senha com bcrypt dentro do Postgres). O navegador nunca recebe
 * hash de senha e o servidor não precisa de service role key: as RPCs
 * públicas (`app_register`, `app_login`, `app_me`, `app_logout`) são
 * liberadas para o papel `anon` e fazem toda a validação no banco.
 *
 * Motivo: no Vercel o sistema de arquivos é somente leitura, então guardar
 * usuários em `backend/database/users.json` fazia todo cadastro falhar com
 * HTTP 500 (EROFS). O banco resolve isso de forma definitiva.
 */

const SUPABASE_URL = (
  process.env.SUPABASE_URL ?? 'https://naemdrvjslhiaqvklehv.supabase.co'
).replace(/\/+$/, '')

// Chave pública (publishable). Pode ficar no bundle: não dá acesso direto às
// tabelas, só às RPCs liberadas para `anon`.
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_BdLFeFZ_r1Lgz7kix9eIBw_DxLGjnn1'

const TIMEOUT_MS = 10_000

export class SupabaseError extends Error {
  constructor(message, { status = 0, dbCode = '' } = {}) {
    super(message)
    this.name = 'SupabaseError'
    this.status = status
    this.dbCode = dbCode
  }
}

/**
 * Chama uma RPC do Postgres.
 * Em caso de erro, `error.message` traz o texto levantado pelo SQL
 * (ex.: "INVALID_CREDENTIALS"), que é o que usamos para traduzir a resposta.
 */
export async function rpc(name, args = {}) {
  let res
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    throw new SupabaseError(`Falha de conexão ao chamar ${name}: ${err.message}`)
  }

  const text = await res.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    const message = payload?.message || `RPC ${name} falhou (HTTP ${res.status}).`
    throw new SupabaseError(message, { status: res.status, dbCode: payload?.code ?? '' })
  }

  return payload
}
