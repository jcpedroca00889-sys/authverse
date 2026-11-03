import { rpc } from '../services/supabase.js';

/**
 * Contas de usuário vivem no Supabase (tabelas `app_users` / `app_sessions`),
 * acessadas só por RPCs SECURITY DEFINER — nunca por escrita de arquivo.
 *
 * Histórico: antes esta camada gravava em `backend/database/users.json`, o que
 * funciona localmente mas quebra no Vercel (filesystem somente leitura), onde
 * todo cadastro retornava HTTP 500. O arquivo `users.json` foi removido.
 */

/** Cria a conta + sessão. Retorna `{ token, username }`. */
export const create = async (username, password) =>
  rpc('app_register', { p_username: username, p_password: password });

/** Autentica e abre sessão. Retorna `{ token, username }`. */
export const authenticate = async (username, password) =>
  rpc('app_login', { p_username: username, p_password: password });

/** Perfil completo da sessão (ou `null` se o token expirou/é inválido). */
export const profile = async (token) => (token ? rpc('app_me', { p_token: token }) : null);

/** Invalida a sessão no banco (usado no logout). */
export const destroySession = async (token) => {
  if (!token) return;
  await rpc('app_logout', { p_token: token });
};
