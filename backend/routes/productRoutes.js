import { Router } from 'express';
import * as c from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, c.list);
router.get('/:id', requireAuth, c.getOne);
export default router;
