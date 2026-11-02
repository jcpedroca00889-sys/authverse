import rateLimit from 'express-rate-limit';

const message = { error: { message: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' } };
const base = { standardHeaders: true, legacyHeaders: false, message };

export const apiLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 120 });
export const authLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 30 });
// Só conta tentativas de login que falharam: bloqueia força bruta.
export const loginLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 6, skipSuccessfulRequests: true });
