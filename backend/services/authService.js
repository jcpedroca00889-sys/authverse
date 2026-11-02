import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as store from '../database/userStore.js';
import { HttpError } from '../middleware/errors.js';

const ROUNDS = 12;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const secretFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../database/.jwt_secret');

function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    return fs.readFileSync(secretFile, 'utf8');
  } catch {
    const s = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(secretFile, s, { mode: 0o600 });
    return s;
  }
}
const SECRET = loadSecret();
const DUMMY_HASH = bcrypt.hashSync('authverse-dummy', ROUNDS); // iguala o tempo de resposta quando o usuário não existe

function validate(username, password) {
  if (typeof username !== 'string' || !USERNAME_RE.test(username))
    throw new HttpError(400, 'Username deve ter 3 a 20 caracteres (letras, números e _).', 'username');
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72)
    throw new HttpError(400, 'A senha deve ter de 8 a 72 caracteres.', 'password');
}

export async function register(username, password, confirmPassword) {
  validate(username, password);
  if (password !== confirmPassword) throw new HttpError(400, 'As senhas não coincidem.', 'confirmPassword');
  const hash = await bcrypt.hash(password, ROUNDS);
  try {
    return await store.create(username, hash);
  } catch (e) {
    if (e.code === 'USERNAME_TAKEN') throw new HttpError(409, 'Este username já está em uso.', 'username');
    throw e;
  }
}

export async function login(username, password) {
  const user = typeof username === 'string' ? await store.findByUsername(username) : undefined;
  const ok = await bcrypt.compare(typeof password === 'string' ? password : '', user?.password ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'Username ou senha incorretos.');
  return user;
}

export const sign = (user) => jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' });
export const verify = (token) => jwt.verify(token, SECRET);
export const publicUser = (u) => ({ id: u.id, username: u.username, createdAt: u.createdAt });
