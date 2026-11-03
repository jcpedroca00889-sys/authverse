import { Router } from 'express';
import * as c from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Rotas públicas (apenas leitura)
router.get('/', requireAuth, c.list);
router.get('/:id', requireAuth, c.getOne);

// Rotas de admin (CRUD completo)
router.post('/', requireAuth, requireAdmin, c.create);
router.put('/:id', requireAuth, requireAdmin, c.update);
router.delete('/:id', requireAuth, requireAdmin, c.remove);

export default router;