import * as authService from '../services/authService.js';
import { HttpError } from './errors.js';

/** Verifica se o usuário atual é admin (username "admin"). */
export function requireAdmin(req, _res, next) {
  const token = authService.tokenFromCookie(req.cookies?.session);
  if (!token) return next(new HttpError(401, 'Sessão inválida ou expirada.'));

  // Obtém o perfil do usuário
  authService.profile(token).then((profile) => {
    if (!profile) return next(new HttpError(401, 'Sessão inválida ou expirada.'));

    // Verifica se é admin (por enquanto, username "admin")
    // Em produção, seria melhor ter um campo is_admin no banco
    const adminUsernames = ['admin'];
    if (!adminUsernames.includes(profile.username)) {
      return next(new HttpError(403, 'Acesso negado. Apenas administradores.'));
    }

    req.userProfile = profile;
    next();
  }).catch(() => {
    next(new HttpError(401, 'Sessão inválida ou expirada.'));
  });
}