import { Router } from 'express';
import * as c from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter, loginLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.post('/register', authLimiter, c.register);
router.post('/login', authLimiter, loginLimiter, c.login);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);
export default router;
