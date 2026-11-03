import * as store from '../database/productStore.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

/** Log de auditoria para ações de produto. */
function auditLog(req, action, details = {}) {
  const timestamp = new Date().toISOString();
  const user = req.userProfile?.username || 'unknown';
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  
  const logEntry = {
    timestamp,
    user,
    ip,
    action,
    details,
    path: req.path,
    method: req.method,
  };
  
  console.log('[AUDIT:PRODUCT]', JSON.stringify(logEntry));
}

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

export const create = asyncHandler(async (req, res) => {
  const data = req.body ?? {};
  const required = ['name', 'tagline', 'description', 'category', 'price', 'accent', 'glyph', 'meta', 'tags', 'features'];
  for (const field of required) {
    if (!data[field] && field !== 'oldPrice' && field !== 'period' && field !== 'badge') {
      throw new HttpError(400, `Campo obrigatório: ${field}`);
    }
  }

  const validCategories = ['skins', 'templates', 'packs', 'assinaturas', 'audio', 'ui'];
  if (!validCategories.includes(data.category)) {
    throw new HttpError(400, 'Categoria inválida.');
  }

  const validAccents = ['violet', 'cyan', 'blue', 'fuchsia', 'emerald', 'amber'];
  if (!validAccents.includes(data.accent)) {
    throw new HttpError(400, 'Acento inválido.');
  }

  const validGlyphs = ['orb', 'cube', 'ring', 'grid', 'wave', 'prism', 'bolt', 'layers'];
  if (!validGlyphs.includes(data.glyph)) {
    throw new HttpError(400, 'Glifo inválido.');
  }

  if (typeof data.price !== 'number' || data.price < 0) {
    throw new HttpError(400, 'Preço deve ser um número positivo.');
  }

  if (data.oldPrice !== undefined && (typeof data.oldPrice !== 'number' || data.oldPrice <= data.price)) {
    throw new HttpError(400, 'Preço antigo deve ser maior que o preço atual.');
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    throw new HttpError(400, 'Tags deve ser um array não vazio.');
  }

  if (!Array.isArray(data.features) || data.features.length === 0) {
    throw new HttpError(400, 'Features deve ser um array não vazio.');
  }

  if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5) {
    throw new HttpError(400, 'Rating deve ser um número entre 0 e 5.');
  }

  if (typeof data.reviews !== 'number' || data.reviews < 0) {
    throw new HttpError(400, 'Reviews deve ser um número positivo.');
  }

  const product = await store.create({
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    category: data.category,
    price: data.price,
    oldPrice: data.oldPrice,
    rating: data.rating ?? 0,
    reviews: data.reviews ?? 0,
    badge: data.badge ?? null,
    accent: data.accent,
    glyph: data.glyph,
    meta: data.meta,
    period: data.period,
    tags: data.tags,
    features: data.features,
    featured: data.featured ?? false,
    releasedAt: data.releasedAt,
  });

  // Auditoria
  auditLog(req, 'PRODUCT_CREATED', { productId: product.id, productName: product.name });

  res.status(201).json({ product });
});

export const update = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const data = req.body ?? {};

  const existing = await store.findById(id);
  if (!existing) throw new HttpError(404, 'Produto não encontrado.');

  if (data.category) {
    const validCategories = ['skins', 'templates', 'packs', 'assinaturas', 'audio', 'ui'];
    if (!validCategories.includes(data.category)) {
      throw new HttpError(400, 'Categoria inválida.');
    }
  }

  if (data.accent) {
    const validAccents = ['violet', 'cyan', 'blue', 'fuchsia', 'emerald', 'amber'];
    if (!validAccents.includes(data.accent)) {
      throw new HttpError(400, 'Acento inválido.');
    }
  }

  if (data.glyph) {
    const validGlyphs = ['orb', 'cube', 'ring', 'grid', 'wave', 'prism', 'bolt', 'layers'];
    if (!validGlyphs.includes(data.glyph)) {
      throw new HttpError(400, 'Glifo inválido.');
    }
  }

  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    throw new HttpError(400, 'Preço deve ser um número positivo.');
  }

  if (data.oldPrice !== undefined && data.oldPrice !== null && (typeof data.oldPrice !== 'number' || data.oldPrice <= (data.price ?? existing.price))) {
    throw new HttpError(400, 'Preço antigo deve ser maior que o preço atual.');
  }

  if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.length === 0)) {
    throw new HttpError(400, 'Tags deve ser um array não vazio.');
  }

  if (data.features !== undefined && (!Array.isArray(data.features) || data.features.length === 0)) {
    throw new HttpError(400, 'Features deve ser um array não vazio.');
  }

  if (data.rating !== undefined && (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5)) {
    throw new HttpError(400, 'Rating deve ser um número entre 0 e 5.');
  }

  if (data.reviews !== undefined && (typeof data.reviews !== 'number' || data.reviews < 0)) {
    throw new HttpError(400, 'Reviews deve ser um número positivo.');
  }

  // Remove campos que não devem ser atualizados
  const { id: _, createdAt, ...allowedUpdates } = data;

  const product = await store.update(id, allowedUpdates);
  
  // Auditoria
  auditLog(req, 'PRODUCT_UPDATED', { productId: id, productName: product?.name, changes: Object.keys(allowedUpdates) });
  
  res.json({ product });
});

export const remove = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  
  // Busca o produto antes de deletar para log
  const existing = await store.findById(id);
  if (!existing) throw new HttpError(404, 'Produto não encontrado.');

  const success = await store.remove(id);
  if (!success) throw new HttpError(404, 'Produto não encontrado.');
  
  // Auditoria
  auditLog(req, 'PRODUCT_DELETED', { productId: id, productName: existing.name });
  
  res.json({ ok: true });
});