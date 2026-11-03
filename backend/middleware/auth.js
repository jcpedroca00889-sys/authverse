import * as authService from '../services/authService.js';
import { HttpError } from './errors.js';

export function requireAuth(req, _res, next) {
  const token = authService.tokenFromCookie(req.cookies?.session);
  if (!token) return next(new HttpError(401, 'Sessão inválida ou expirada.'));
  req.sessionToken = token;
  next();
}
