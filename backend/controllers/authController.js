import * as authService from '../services/authService.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const COOKIE = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

/** Monta a resposta com o usuário público a partir do perfil vindo do banco. */
async function startSession(res, session, status = 200) {
  const profile = await authService.profile(session.token);
  if (!profile) throw new HttpError(503, 'Sessão criada, mas o perfil não pôde ser carregado. Tente entrar novamente.');

  return res
    .cookie('session', authService.sign(session), { ...COOKIE, maxAge: SEVEN_DAYS })
    .status(status)
    .json({ user: authService.publicUser(profile) });
}

export const register = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword } = req.body ?? {};
  const session = await authService.register(username, password, confirmPassword);
  await startSession(res, session, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  const session = await authService.login(username, password);
  await startSession(res, session);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(authService.tokenFromCookie(req.cookies?.session));
  res.clearCookie('session', COOKIE).json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.profile(req.sessionToken);
  if (!profile) throw new HttpError(401, 'Sessão inválida ou expirada.');
  res.json({ user: authService.publicUser(profile) });
});
