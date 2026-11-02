import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
