import * as authService from '../services/authService.js';
import { HttpError } from './errors.js';

export function requireAuth(req, _res, next) {
  try {
    req.userId = authService.verify(req.cookies?.session).sub;
    next();
  } catch {
    next(new HttpError(401, 'Sessão inválida ou expirada.'));
  }
}
