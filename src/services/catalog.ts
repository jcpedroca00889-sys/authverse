import { supabase, getSessionToken } from '../lib/supabase'
import type {
  CatalogSort,
  ListingInput,
  Order,
  OrderItem,
  Product,
  ProductQuery,
  Seller,
} from '../lib/types'
import { SELLERS, sellerByUsername, gameBySlug } from '../data/catalog'
import { PRODUCTS_SEED } from '../data/catalog'
import { uid } from '../lib/format'

/* ═══════════════════════════════════════════════════════════
 * Cache síncrono (tudo vem do Supabase, nunca do localStorage)
 * ═══════════════════════════════════════════════════════════ */

let _listingsCache: Product[] = []

/* ── Mapeamento Supabase (snake_case → camelCase) ────────── */

function mapProduct(r: any): Product {
  return {
    id: r.id,
    title: r.title,
    game: r.game,
    category: r.category,
    price: Number(r.price),
    oldPrice: r.old_price != null ? Number(r.old_price) : undefined,
    delivery: r.delivery,
    description: r.description ?? '',
    details: r.details ?? [],
    reviews: r.reviews ?? [],
    sellerUsername: r.seller_username,
    rating: Number(r.rating),
    ratingCount: r.rating_count,
    salesCount: r.sales_count,
    createdAt: r.created_at,
    status: r.status,
    stock: r.stock,
    emoji: r.emoji ?? '🎁',
    art: r.art ?? 0,
    tags: r.tags ?? [],
    demo: r.demo ?? false,
    featured: r.featured ?? false,
    variants: r.variants ?? [],
  }
}

function mapOrder(r: any): Order {
  return {
    id: r.id,
    code: r.code,
    date: r.date,
    buyer: r.buyer,
    buyerName: r.buyer_name ?? undefined,
    buyerCpf: r.buyer_cpf ?? undefined,
    items: r.items ?? [],
    subtotal: Number(r.subtotal),
    discount: Number(r.discount),
    total: Number(r.total),
    paymentMethod: r.payment_method ?? '',
    status: r.status,
    demo: r.demo ?? false,
    gateway: r.gateway ?? 'mock',
  }
}

/* ── Seeding dos produtos demo no Supabase ──────────────── */

async function seedDemoProducts(): Promise<void> {
  // Verifica se já existem produtos demo
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('demo', true)

  if (count && count > 0) return // já seeded

  // Prepara os dados para a RPC (SECURITY DEFINER — bypassa RLS)
  const rows = PRODUCTS_SEED.map((p) => ({
    id: p.id,
    title: p.title,
    game: p.game,
    category: p.category,
    price: p.price,
    old_price: p.oldPrice ?? null,
    delivery: p.delivery,
    description: p.description,
    details: p.details,
    reviews: p.reviews,
    seller_username: p.sellerUsername,
    rating: p.rating,
    rating_count: p.ratingCount,
    sales_count: p.salesCount,
    created_at: p.createdAt,
    status: p.status,
    stock: p.stock,
    emoji: p.emoji || '🎁',
    art: p.art,
    tags: p.tags,
    demo: true,
    featured: p.featured ?? false,
    variants: p.variants ?? [],
  }))

  const { error } = await supabase.rpc('seed_demo_products', { products: rows })
  if (error) {
    console.warn('[MONKEY] Erro ao seed produtos demo:', error.message)
  }
}

/** Atualiza o cache lendo do Supabase. */
export async function refreshListings(): Promise<void> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  _listingsCache = (data ?? []).map(mapProduct)
}

/* ── Listings (sync, lêem do cache) ───────────────────────── */

export function getMyListings(username: string): Product[] {
  return _listingsCache.filter((p) => p.sellerUsername === username)
}

export function getAllListings(): Product[] {
  return _listingsCache
}

export function getAllProducts(): Product[] {
  return _listingsCache.filter((p) => p.status !== 'paused')
}

/* ── Escrita (Supabase) ────────────────────────────────────── */

export async function createListing(username: string, input: ListingInput): Promise<Product> {
  const token = getSessionToken()
  if (!token) throw new Error('NOT_AUTHENTICATED')

  const payload = {
    title: input.title,
    game: input.game,
    category: input.category,
    price: input.price,
    oldPrice: input.oldPrice ?? null,
    delivery: input.delivery,
    description: input.description,
    stock: input.stock,
    emoji: input.emoji || '🎁',
    art: input.art ?? 0,
    tags: input.title.split(' ').slice(0, 3),
  }

  const { data, error } = await supabase.rpc('listing_create', {
    p_token: token,
    p_product: payload,
  })
  if (error) throw new Error(error.message)

  await refreshListings()
  return mapProduct(data)
}

export async function updateListing(
  id: string,
  patch: Partial<ListingInput> & { status?: Product['status'] },
): Promise<Product | null> {
  const token = getSessionToken()
  if (!token) throw new Error('NOT_AUTHENTICATED')

  const { data, error } = await supabase.rpc('listing_update', {
    p_token: token,
    p_id: id,
    p_patch: {
      title: patch.title,
      game: patch.game,
      category: patch.category,
      price: patch.price,
      oldPrice: patch.oldPrice,
      stock: patch.stock,
      delivery: patch.delivery,
      description: patch.description,
      emoji: patch.emoji,
      art: patch.art,
      status: patch.status,
    },
  })
  if (error) throw new Error(error.message)

  await refreshListings()
  return data ? mapProduct(data) : null
}

export async function deleteListing(id: string): Promise<void> {
  const token = getSessionToken()
  if (!token) throw new Error('NOT_AUTHENTICATED')

  await supabase.rpc('listing_delete', { p_token: token, p_id: id })
  await refreshListings()
}

/* ── Consultas ─────────────────────────────────────────────── */

function matchesQuery(p: Product, q: ProductQuery): boolean {
  const t = (q.q ?? '').toLowerCase().trim()
  if (t) {
    const game = gameBySlug(p.game)
    const seller = sellerByUsername(p.sellerUsername)
    const hay = `${p.title} ${p.category} ${p.tags.join(' ')} ${game.name} ${game.short} ${seller?.displayName ?? p.sellerUsername}`.toLowerCase()
    if (!hay.includes(t)) return false
  }
  if (q.game && q.game !== 'all' && p.game !== q.game) return false
  if (q.category && q.category !== 'all' && p.category !== q.category) return false
  if (typeof q.min === 'number' && p.price < q.min) return false
  if (typeof q.max === 'number' && p.price > q.max) return false
  if (typeof q.minRating === 'number' && p.rating < q.minRating) return false
  if (q.auto && p.delivery !== 'automatic') return false
  if (q.onlyAvailable && p.status !== 'available') return false
  if (q.deal) {
    const d = p.oldPrice && p.oldPrice > p.price ? (p.oldPrice - p.price) / p.oldPrice : 0
    if (d < 0.2) return false
  }
  return true
}

function sortProducts(list: Product[], sort: CatalogSort): Product[] {
  const byId = [...list]
  switch (sort) {
    case 'price-asc': return byId.sort((a, b) => a.price - b.price)
    case 'price-desc': return byId.sort((a, b) => b.price - a.price)
    case 'best-sellers': return byId.sort((a, b) => b.salesCount - a.salesCount)
    case 'newest': return byId.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'rating': return byId.sort((a, b) => b.rating - a.rating)
    case 'relevance':
    default: return byId.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
  }
}

export async function fetchProducts(q: ProductQuery = {}): Promise<{ items: Product[]; total: number }> {
  const filtered = getAllProducts().filter((p) => matchesQuery(p, q))
  const sorted = sortProducts(filtered, q.sort ?? 'relevance')
  const offset = q.offset ?? 0
  const limit = q.limit ?? 9999
  return { items: sorted.slice(offset, offset + limit), total: sorted.length }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  return getAllProducts().find((p) => p.id === id) ?? null
}

export async function fetchSeller(username: string): Promise<Seller | null> {
  const known = sellerByUsername(username)
  if (known) return known

  const userListings = getMyListings(username)
  if (userListings.length === 0) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_username', username)
      .limit(1)
    if (!data || data.length === 0) return null
    const salesCount = data.reduce((acc, l) => acc + (l.sales_count ?? 0), 0)
    return usernameToSeller(username, salesCount)
  }
  return usernameToSeller(username, userListings.reduce((acc, l) => acc + l.salesCount, 0))
}

function usernameToSeller(username: string, salesCount: number): Seller {
  return {
    username,
    displayName: username,
    verified: false,
    rating: 0,
    ratingCount: 0,
    salesCount,
    memberSince: new Date().toISOString().slice(0, 10),
    responseTime: '~15 min',
    description: 'Vendedor da MONKEY LARANJA anunciando direto na plataforma.',
    tags: ['Anunciante'],
  }
}

export async function fetchRelated(product: Product, limit = 4): Promise<Product[]> {
  const { items } = await fetchProducts({ game: product.game, limit: 40 })
  return items.filter((p) => p.id !== product.id).slice(0, limit)
}

export async function fetchSellerListings(username: string): Promise<Product[]> {
  return getAllProducts()
    .filter((p) => p.sellerUsername === username)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/* ── Home — seções prontas ─────────────────────────────────── */

export interface HomeSections {
  featured: Product[]
  bestSellers: Product[]
  deals: Product[]
  newest: Product[]
  cheapest: Product[]
  robloxPopular: Product[]
  opportunities: Product[]
}

export async function fetchHomeSections(): Promise<HomeSections> {
  const all = getAllProducts()
  const ratingOk = (p: Product) => p.rating >= 4.4 && p.ratingCount >= 3
  const discountOf = (p: Product) =>
    p.oldPrice && p.oldPrice > p.price ? (p.oldPrice - p.price) / p.oldPrice : 0

  const featured = all.filter((p) => p.featured || ratingOk(p)).slice(0, 10)
  const bestSellers = [...all].sort((a, b) => b.salesCount - a.salesCount).slice(0, 10)
  const deals = all.filter((p) => discountOf(p) >= 0.2).sort((a, b) => discountOf(b) - discountOf(a)).slice(0, 10)
  const newest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10)
  const cheapest = [...all].sort((a, b) => a.price - b.price).slice(0, 10)
  const robloxPopular = all.filter((p) => p.game === 'roblox').sort((a, b) => b.salesCount - a.salesCount).slice(0, 10)
  const opportunities = all
    .filter((p) => discountOf(p) >= 0.2 || (p.price <= 60 && p.rating >= 4.6))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)

  return { featured, bestSellers, deals, newest, cheapest, robloxPopular, opportunities }
}

/* ── Pedidos ────────────────────────────────────────────────── */

export async function fetchOrders(username: string): Promise<Order[]> {
  const token = getSessionToken()
  if (!token) return []
  const { data, error } = await supabase.rpc('orders_mine', { p_token: token })
  if (error) {
    console.warn('[MONKEY] orders_mine:', error.message)
    return []
  }
  return Array.isArray(data) ? (data as any[]).map(mapOrder) : []
}

export interface PlaceOrderInput {
  buyer: string
  buyerName: string
  /** CPF só com dígitos (usado na emissão do pedido). */
  buyerCpf: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  gateway: 'mock' | 'saldo'
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const token = getSessionToken()
  if (!token) throw new Error('NOT_AUTHENTICATED')

  // A RPC order_place define o comprador a partir do token (nunca confia no front)
  const order = {
    id: uid('ord'),
    code: `ML-${Math.floor(100000 + Math.random() * 899999)}`,
    date: new Date().toISOString(),
    buyerName: input.buyerName,
    buyerCpf: input.buyerCpf,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    total: input.total,
    paymentMethod: input.paymentMethod,
    gateway: input.gateway,
  }

  const { data, error } = await supabase.rpc('order_place', { p_token: token, p_order: order })
  if (error) throw new Error(error.message)

  return mapOrder(data)
}

export async function fetchSellerOrders(username: string): Promise<Order[]> {
  const token = getSessionToken()
  if (!token) return []
  const { data, error } = await supabase.rpc('orders_seller', { p_token: token })
  if (error) {
    console.warn('[MONKEY] orders_seller:', error.message)
    return []
  }
  return Array.isArray(data) ? (data as any[]).map(mapOrder) : []
}

export const clearAllLocalData = () => {
  // Tudo agora está no Supabase — sem localStorage
}

/* ── Favoritos ──────────────────────────────────────────────── */

const FAVORITES_CACHE_KEY = 'monkey_favs_cache'
let _favsCache: string[] = []

export async function fetchFavorites(username: string): Promise<string[]> {
  const token = getSessionToken()
  if (!token) return []
  const { data, error } = await supabase.rpc('favorites_list', { p_token: token })
  if (error) {
    console.warn('[MONKEY] favorites_list:', error.message)
    return []
  }
  const ids = Array.isArray(data) ? (data as string[]) : []
  _favsCache = ids
  localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(ids))
  return ids
}

export async function addFavorite(username: string, productId: string): Promise<void> {
  const token = getSessionToken()
  if (!token) return
  const { error } = await supabase.rpc('favorite_add', { p_token: token, p_product_id: productId })
  if (error) console.warn('[MONKEY] favorite_add:', error.message)
  _favsCache.push(productId)
  localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(_favsCache))
}

export async function removeFavorite(username: string, productId: string): Promise<void> {
  const token = getSessionToken()
  if (!token) return
  const { error } = await supabase.rpc('favorite_remove', { p_token: token, p_product_id: productId })
  if (error) console.warn('[MONKEY] favorite_remove:', error.message)
  _favsCache = _favsCache.filter((id) => id !== productId)
  localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(_favsCache))
}

export function getCachedFavorites(): string[] {
  if (_favsCache.length > 0) return _favsCache
  try {
    const raw = localStorage.getItem(FAVORITES_CACHE_KEY)
    if (raw) _favsCache = JSON.parse(raw) as string[]
  } catch { /* ignore */ }
  return _favsCache
}

/* ── Gateway de pagamento ──────────────────────────────────── */

export const paymentGateway = {
  provider: null as null | 'stripe' | 'mercadopago' | 'asaas',
  status: 'not-connected' as 'not-connected' | 'connected',
  async charge(payload: { amount: number; method: string }): Promise<{ authorized: boolean; code: string }> {
    await new Promise((r) => setTimeout(r, 900))
    return { authorized: true, code: `MOCK-${Math.floor(Math.random() * 1e6)}` }
  },
}

/* ── Init cache (chamar no entrypoint) ─────────────────────── */

export async function initCatalog(): Promise<void> {
  await seedDemoProducts()
  await refreshListings()
}