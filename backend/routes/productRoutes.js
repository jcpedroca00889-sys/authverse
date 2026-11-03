import { Router } from 'express';
import * as c from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin, adminLimiter } from '../middleware/admin.js';

const router = Router();

// Rotas públicas (apenas leitura)
router.get('/', requireAuth, c.list);
router.get('/:id', requireAuth, c.getOne);

// Rotas de admin (CRUD completo) - com rate limiting admin e verificação dupla
router.post('/', requireAuth, adminLimiter, requireAdmin, c.create);
router.put('/:id', requireAuth, adminLimiter, requireAdmin, c.update);
router.delete('/:id', requireAuth, adminLimiter, requireAdmin, c.remove);

export default router;