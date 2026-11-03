import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as store from '../database/userStore.js';
import { HttpError } from '../middleware/errors.js';
import { SupabaseError } from './supabase.js';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const secretFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../database/.jwt_secret');

function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    return fs.readFileSync(secretFile, 'utf8');
  } catch {
    const s = crypto.randomBytes(48).toString('hex');
    try {
      fs.writeFileSync(secretFile, s, { mode: 0o600 });
    } catch {
      // Filesystem somente leitura (Vercel): o segredo vale só para este processo.
    }
    return s;
  }
}
const SECRET = loadSecret();

function validate(username, password) {
  if (typeof username !== 'string' || !USERNAME_RE.test(username))
    throw new HttpError(400, 'Username deve ter 3 a 20 caracteres (letras, números e _).', 'username');
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72)
    throw new HttpError(400, 'A senha deve ter de 8 a 72 caracteres.', 'password');
}

const normalize = (username) => (typeof username === 'string' ? username.trim() : username);

/** O Postgres sinaliza os erros de negócio pelo texto da EXCEPTION (ex.: INVALID_CREDENTIALS). */
const isDbSignal = (err, signal) =>
  err instanceof SupabaseError && typeof err.message === 'string' && err.message.toUpperCase().includes(signal);

const unavailable = () =>
  new HttpError(503, 'Não foi possível concluir agora. Tente novamente em instantes.');

export async function register(username, password, confirmPassword) {
  const name = normalize(username);
  validate(name, password);
  if (password !== confirmPassword) throw new HttpError(400, 'As senhas não coincidem.', 'confirmPassword');

  try {
    return await store.create(name, password);
  } catch (e) {
    if (isDbSignal(e, 'USERNAME_TAKEN')) throw new HttpError(409, 'Este username já está em uso.', 'username');
    if (isDbSignal(e, 'USERNAME_INVALID'))
      throw new HttpError(400, 'Username deve ter 3 a 20 caracteres (letras, números e _).', 'username');
    if (isDbSignal(e, 'PASSWORD_TOO_SHORT')) throw new HttpError(400, 'A senha deve ter de 8 a 72 caracteres.', 'password');
    console.error('[auth] falha ao registrar:', e);
    throw unavailable();
  }
}

export async function login(username, password) {
  const name = normalize(username);
  try {
    return await store.authenticate(name, typeof password === 'string' ? password : '');
  } catch (e) {
    if (isDbSignal(e, 'INVALID_CREDENTIALS')) throw new HttpError(401, 'Username ou senha incorretos.');
    if (isDbSignal(e, 'TOO_MANY_ATTEMPTS'))
      throw new HttpError(429, 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.');
    console.error('[auth] falha ao autenticar:', e);
    throw unavailable();
  }
}

/** Perfil da sessão; `null` quando o token não vale mais. */
export async function profile(token) {
  if (!token) return null;
  try {
    return await store.profile(token);
  } catch (e) {
    console.error('[auth] falha ao ler sessão:', e);
    throw unavailable();
  }
}

export async function logout(token) {
  try {
    await store.destroySession(token);
  } catch (e) {
    // Logout nunca deve falhar para o usuário: o cookie é limpo de qualquer forma.
    console.warn('[auth] falha ao encerrar sessão no banco:', e.message);
  }
}

/** Cookie assinado guarda o token da sessão do Supabase. */
export const sign = (session) => jwt.sign({ sub: session.token }, SECRET, { expiresIn: '7d' });

export const tokenFromCookie = (cookie) => {
  try {
    return jwt.verify(cookie, SECRET).sub;
  } catch {
    return null;
  }
};

export const publicUser = (p) => ({ id: p.username, username: p.username, createdAt: p.created_at });
