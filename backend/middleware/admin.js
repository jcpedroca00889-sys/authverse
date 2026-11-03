import * as authService from '../services/authService.js';
import { HttpError } from './errors.js';
import rateLimit from 'express-rate-limit';

/** Rate limiter específico para endpoints admin (mais restritivo). */
export const adminLimiter = rateLimit({
  windowMs: 60_000, // 1 minuto
  limit: 30, // 30 requisições por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Muitas requisições admin. Aguarde um momento.' } },
  keyGenerator: (req) => req.ip,
});

/** Log de auditoria para ações admin. */
function auditLog(req, action, details = {}) {
  const timestamp = new Date().toISOString();
  const user = req.userProfile?.username || 'unknown';
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  const logEntry = {
    timestamp,
    user,
    ip,
    userAgent,
    action,
    details,
    path: req.path,
    method: req.method,
  };
  
  // Log estruturado para ferramentas de observabilidade
  console.log('[AUDIT]', JSON.stringify(logEntry));
  
  // Em produção, enviar para sistema de logs centralizado (ex.: Loki, Datadog, etc.)
}

/** Verifica se o usuário atual é admin (dupla verificação: JWT claim + env var). */
export function requireAdmin(req, _res, next) {
  const cookie = req.cookies?.session;
  if (!cookie) return next(new HttpError(401, 'Sessão inválida ou expirada.'));

  try {
    // 1. Verifica o claim isAdmin no JWT (tamper-proof)
    const payload = authService.payloadFromCookie(cookie);
    if (!payload) return next(new HttpError(401, 'Sessão inválida ou expirada.'));
    
    if (!payload.isAdmin) {
      auditLog(req, 'ADMIN_ACCESS_DENIED', { reason: 'jwt_claim_false', payloadUsername: payload.username });
      return next(new HttpError(403, 'Acesso negado. Apenas administradores.'));
    }

    // 2. Dupla verificação contra variável de ambiente (defesa em profundidade)
    if (!authService.isAdminUsername(payload.username)) {
      auditLog(req, 'ADMIN_ACCESS_DENIED', { reason: 'env_var_mismatch', payloadUsername: payload.username });
      return next(new HttpError(403, 'Acesso negado. Configuração de admin inválida.'));
    }

    // 3. Busca perfil completo para anexar ao request
    authService.profile(payload.sub).then((profile) => {
      if (!profile) {
        auditLog(req, 'ADMIN_ACCESS_DENIED', { reason: 'profile_not_found', payloadUsername: payload.username });
        return next(new HttpError(401, 'Sessão inválida ou expirada.'));
      }

      if (!profile.isAdmin) {
        auditLog(req, 'ADMIN_ACCESS_DENIED', { reason: 'profile_isAdmin_false', profileUsername: profile.username });
        return next(new HttpError(403, 'Acesso negado. Perfil sem permissão de admin.'));
      }

      // Sucesso: anexa perfil ao request
      req.userProfile = profile;
      req.adminPayload = payload; // JWT payload original para referência
      
      // Log de acesso admin bem-sucedido
      auditLog(req, 'ADMIN_ACCESS_GRANTED', { username: profile.username });
      
      next();
    }).catch((err) => {
      console.error('[admin] erro ao verificar perfil:', err);
      auditLog(req, 'ADMIN_ACCESS_ERROR', { error: err.message });
      next(new HttpError(401, 'Erro ao verificar permissão de admin.'));
    });
  } catch (err) {
    console.error('[admin] erro na verificação JWT:', err);
    auditLog(req, 'ADMIN_ACCESS_ERROR', { error: err.message });
    next(new HttpError(401, 'Sessão inválida ou expirada.'));
  }
}

/** Middleware opcional: apenas anexa info de admin sem bloquear (para uso no frontend). */
export function attachAdminInfo(req, _res, next) {
  const cookie = req.cookies?.session;
  if (!cookie) return next();
  
  try {
    const payload = authService.payloadFromCookie(cookie);
    if (payload) {
      req.isAdmin = payload.isAdmin === true;
      req.adminUsername = payload.username;
    }
  } catch {
    // Ignora erros - é opcional
  }
  next();
}