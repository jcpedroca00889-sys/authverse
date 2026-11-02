import * as authService from '../services/authService.js';
import * as store from '../database/userStore.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const COOKIE = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const startSession = (res, user, status = 200) =>
  res
    .cookie('session', authService.sign(user), { ...COOKIE, maxAge: SEVEN_DAYS })
    .status(status)
    .json({ user: authService.publicUser(user) });

export const register = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword } = req.body ?? {};
  startSession(res, await authService.register(username, password, confirmPassword), 201);
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  startSession(res, await authService.login(username, password));
});

export const logout = (_req, res) => res.clearCookie('session', COOKIE).json({ ok: true });

export const me = asyncHandler(async (req, res) => {
  const user = await store.findById(req.userId);
  if (!user) throw new HttpError(401, 'Sessão inválida ou expirada.');
  res.json({ user: authService.publicUser(user) });
});
