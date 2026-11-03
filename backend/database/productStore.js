import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'products.json');

const SORTERS = {
  relevance: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviews - a.reviews,
  newest: (a, b) => b.releasedAt.localeCompare(a.releasedAt),
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
};

async function read() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return { products: [] };
    throw e;
  }
}

async function write(data) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(name) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
  const suffix = crypto.randomBytes(4).toString('hex');
  return `${base}-${suffix}`;
}

export async function list({ category, q, sort } = {}) {
  const { products } = await read();
  let items = products;

  if (category && category !== 'all') items = items.filter((p) => p.category === category);
  if (q) {
    const term = q.toLowerCase();
    items = items.filter((p) => `${p.name} ${p.tagline} ${p.tags.join(' ')}`.toLowerCase().includes(term));
  }

  return items.slice().sort(SORTERS[sort] ?? SORTERS.relevance);
}

export const findById = async (id) => (await read()).products.find((p) => p.id === id);

export async function create(productData) {
  const { products } = await read();
  const now = new Date().toISOString().split('T')[0];
  const newProduct = {
    ...productData,
    id: generateId(productData.name),
    rating: 0,
    reviews: 0,
    featured: productData.featured ?? false,
    releasedAt: productData.releasedAt ?? now,
    createdAt: now,
    updatedAt: now,
  };
  products.push(newProduct);
  await write({ products });
  return newProduct;
}

export async function update(id, updates) {
  const { products } = await read();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  const updated = {
    ...products[index],
    ...updates,
    id: products[index].id, // não permite mudar ID
    updatedAt: now,
  };
  products[index] = updated;
  await write({ products });
  return updated;
}

export async function remove(id) {
  const { products } = await read();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  await write({ products });
  return true;
}