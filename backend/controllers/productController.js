import * as store from '../database/productStore.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

export const list = asyncHandler(async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 60) : undefined;
  const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
  const products = await store.list({ category, q, sort });
  res.json({ products, total: products.length });
});

export const getOne = asyncHandler(async (req, res) => {
  const product = await store.findById(String(req.params.id));
  if (!product) throw new HttpError(404, 'Produto não encontrado.');
  res.json({ product });
});
