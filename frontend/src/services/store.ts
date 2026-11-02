import { ApiError } from './api';

export type Category = 'skins' | 'templates' | 'packs' | 'assinaturas' | 'audio' | 'ui';
export type Accent = 'violet' | 'cyan' | 'blue' | 'fuchsia' | 'emerald' | 'amber';
export type Glyph = 'orb' | 'cube' | 'ring' | 'grid' | 'wave' | 'prism' | 'bolt' | 'layers';
export type SortKey = 'relevance' | 'newest' | 'priceAsc' | 'priceDesc' | 'rating';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge: string | null;
  accent: Accent;
  glyph: Glyph;
  meta: string;
  period?: string;
  tags: string[];
  features: string[];
  featured: boolean;
  releasedAt: string;
}

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'skins', label: 'Skins' },
  { id: 'templates', label: 'Templates' },
  { id: 'packs', label: 'Packs' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'audio', label: 'Áudio' },
  { id: 'ui', label: 'UI Kits' },
];

export const SORTS: { id: SortKey; label: string }[] = [
  { id: 'relevance', label: 'Relevância' },
  { id: 'newest', label: 'Novidades' },
  { id: 'priceAsc', label: 'Menor preço' },
  { id: 'priceDesc', label: 'Maior preço' },
  { id: 'rating', label: 'Melhor avaliados' },
];

export const categoryLabel = (id: Category | 'all') => CATEGORIES.find((c) => c.id === id)?.label ?? 'Todos';

/** Nível de organização acima das categorias. */
export type ProductType = 'ativos' | 'pacotes' | 'assinaturas';

export const TYPES: { id: ProductType; label: string; categories: Category[] }[] = [
  { id: 'ativos', label: 'Ativos Digitais', categories: ['skins', 'templates', 'audio', 'ui'] },
  { id: 'pacotes', label: 'Packs', categories: ['packs'] },
  { id: 'assinaturas', label: 'Assinaturas', categories: ['assinaturas'] },
];

export const typeOf = (category: Category): ProductType =>
  category === 'packs' ? 'pacotes' : category === 'assinaturas' ? 'assinaturas' : 'ativos';

export const typeLabel = (id: ProductType) => TYPES.find((t) => t.id === id)?.label ?? id;

export const categoriesOf = (type: ProductType) => TYPES.find((t) => t.id === type)?.categories ?? [];

export const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  let res: Response;
  try {
    res = await fetch('/api/products', { credentials: 'same-origin', signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('Não foi possível conectar à loja. Verifique sua conexão.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error?.message ?? 'Não foi possível carregar o catálogo.', undefined, res.status);
  return (data.products ?? []) as Product[];
}
