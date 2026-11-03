/* ─────────────────────────────────────────────────────────────
 * Tipos do marketplace MONKEY LARANJA
 * ───────────────────────────────────────────────────────────── */

export type GameSlug =
  | 'roblox'
  | 'free-fire'
  | 'valorant'
  | 'fortnite'
  | 'minecraft'
  | 'gta-v'
  | 'steam'
  | 'blox-fruits'
  | 'grow-a-garden'
  | 'outros'

export interface Game {
  slug: GameSlug
  name: string
  /** nome curto para chips */
  short: string
  /** emoji ilustrativo (fallback da arte) */
  emoji: string
  /** gradiente da arte em 3 paradas */
  gradient: [string, string, string]
  /** cor de destaque (bordas/selos) */
  accent: string
}

export interface Seller {
  username: string
  displayName: string
  verified: boolean
  rating: number
  ratingCount: number
  salesCount: number
  memberSince: string
  responseTime: string
  description: string
  tags: string[]
}

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
}

export type DeliveryType = 'automatic' | 'manual'
export type ProductStatus = 'available' | 'low' | 'paused'

/* ── Variações do produto (planos / pacotes / tiers) ─────────── */
export type VariantPeriod = 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'vitalicio'

export interface ProductVariant {
  /** Nome curto (ex.: "Mensal", "Pequeno", "Bronze") */
  name: string
  /** Subtítulo descritivo */
  subtitle?: string
  price: number
  oldPrice?: number
  /** Quantidade mínima permitida */
  minQty: number
  /** Quantidade máxima permitida */
  maxQty: number
  /** Período (para planos por tempo) */
  period?: VariantPeriod
  /** Emoji ilustrativo */
  emoji?: string
  /** Badge de destaque */
  badge?: string
  /** Itens/pacotes inclusos */
  includes?: string[]
}

export interface Product {
  id: string
  title: string
  game: GameSlug
  category: string
  /** Preço base (usado quando não há variantes) */
  price: number
  oldPrice?: number
  /** Variações disponíveis (opcional) */
  variants?: ProductVariant[]
  delivery: DeliveryType
  description: string
  details: string[]
  sellerUsername: string
  rating: number
  ratingCount: number
  salesCount: number
  createdAt: string
  status: ProductStatus
  stock: number
  /** emoji ilustrativo do produto */
  emoji: string
  /** variação da arte (galeria) */
  art: number
  tags: string[]
  reviews: Review[]
  /** true = produto demonstrativo vindo do catálogo demo */
  demo: boolean
  /** destaque na vitrine principal */
  featured?: boolean
}

export interface CartItem {
  product: Product
  qty: number
  /** Variação selecionada (se houver) */
  variantName?: string
  /** Preço unitário no momento da adição ao carrinho */
  unitPrice: number
}

export type OrderStatus = 'PAGO' | 'PENDENTE' | 'ENTREGUE' | 'CANCELADO'

export interface OrderItem {
  productId: string
  title: string
  game: GameSlug
  price: number
  qty: number
  delivery: DeliveryType
  variantName?: string
}

export interface Order {
  id: string
  code: string
  date: string
  buyer: string
  /** Nome completo informado no checkout (opcional). */
  buyerName?: string
  /** CPF só com dígitos (visível apenas para o comprador). */
  buyerCpf?: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  status: OrderStatus
  demo?: boolean
  gateway: 'mock' | string
}

export interface ListingInput {
  title: string
  game: GameSlug
  category: string
  price: number
  oldPrice?: number
  stock: number
  delivery: DeliveryType
  description: string
  emoji: string
  art: number
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
  method: string
  demo?: boolean
}

export interface ToastMsg {
  id: number
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
}

/* ── Filtros de busca ──────────────────────────────────────── */
export type CatalogSort =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'best-sellers'
  | 'newest'
  | 'rating'

export interface ProductQuery {
  q?: string
  game?: GameSlug | 'all'
  category?: string | 'all'
  min?: number
  max?: number
  minRating?: number
  auto?: boolean
  onlyAvailable?: boolean
  deal?: boolean
  sort?: CatalogSort
  limit?: number
  offset?: number
}