import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Filter, SlidersHorizontal, X } from 'lucide-react'
import FilterSidebar, { type FiltersState } from '../components/store/FilterSidebar'
import ProductGrid from '../components/store/ProductGrid'
import { ProductGridSkeleton } from '../components/store/Skeletons'
import { EmptyState } from '../components/store/Skeletons'
import { gameBySlug } from '../data/catalog'
import { fetchProducts } from '../services/catalog'
import type { CatalogSort, Product } from '../lib/types'
import { PackageSearch } from 'lucide-react'

const PAGE_SIZE = 12

const SORTS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'best-sellers', label: 'Mais vendidos' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'rating', label: 'Melhor avaliação' },
]

function parseParams(sp: URLSearchParams): FiltersState {
  const num = (k: string) => {
    const v = sp.get(k)
    return v === null || v === '' ? undefined : Number(v)
  }
  return {
    game: (sp.get('jogo') as FiltersState['game']) ?? 'all',
    category: (sp.get('cat') as FiltersState['category']) ?? 'all',
    min: num('min'),
    max: num('max'),
    minRating: num('nota') ?? 0,
    auto: sp.get('auto') === '1',
    onlyAvailable: sp.get('disponivel') === '1',
  }
}

export default function CatalogPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState<FiltersState>(() => parseParams(searchParams))
  const [sort, setSort] = useState<CatalogSort>((searchParams.get('sort') as CatalogSort) ?? 'relevance')
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [mobileOpen, setMobileOpen] = useState(false)

  /* Categoria via rota /loja/categoria/:slug */
  useEffect(() => {
    if (slug) setSearchParams((prev) => ({ ...Object.fromEntries(prev), jogo: slug }), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  /* Sincroniza filtros quando a URL muda (ex.: busca no header) */
  useEffect(() => {
    setFilters(parseParams(searchParams))
    setSort((searchParams.get('sort') as CatalogSort) ?? 'relevance')
    setVisible(PAGE_SIZE)
  }, [searchParams])

  const query = useMemo(() => {
    const deal = searchParams.get('ofertas') === '1'
    const q = searchParams.get('q') ?? undefined
    return {
      q,
      game: filters.game,
      category: filters.category,
      min: filters.min,
      max: filters.max,
      minRating: filters.minRating,
      auto: filters.auto,
      onlyAvailable: filters.onlyAvailable,
      deal,
      sort,
    }
  }, [filters, sort, searchParams])

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchProducts(query).then((res) => {
      if (!alive) return
      setProducts(res.items)
      setTotal(res.total)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [query])

  const updateParams = useCallback(
    (patch: Partial<FiltersState> | { sort?: CatalogSort }) => {
      const next = new URLSearchParams(searchParams)
      const f = { ...filters, ...patch }
      const set = (key: string, v: string | undefined) => {
        if (v === undefined || v === '' || v === 'all' || v === '0') next.delete(key)
        else next.set(key, v)
      }
      set('jogo', f.game === 'all' ? undefined : f.game)
      set('cat', f.category === 'all' ? undefined : f.category)
      set('min', f.min === undefined ? undefined : String(f.min))
      set('max', f.max === undefined ? undefined : String(f.max))
      set('nota', f.minRating ? String(f.minRating) : undefined)
      set('auto', f.auto ? '1' : undefined)
      set('disponivel', f.onlyAvailable ? '1' : undefined)
      if ('sort' in patch) set('sort', patch.sort === 'relevance' ? undefined : patch.sort)
      setSearchParams(next)
    },
    [filters, searchParams, setSearchParams],
  )

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(sort ? { sort } : {}))
    setMobileOpen(false)
  }, [setSearchParams, sort])

  const game = filters.game !== 'all' ? gameBySlug(filters.game) : null
  const searchTerm = searchParams.get('q') ?? ''
  const isDeals = searchParams.get('ofertas') === '1'

  const title = isDeals
    ? 'Ofertas imperdíveis'
    : game
      ? game.name
      : searchTerm
        ? `Resultados para "${searchTerm}"`
        : 'Todos os anúncios'

  const loadMore = () => {
    setVisible((v) => v + PAGE_SIZE)
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-4 pt-5 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-sand/70">
        <Link to="/loja" className="transition-colors hover:text-gold">Início</Link>
        <ChevronRight size={12} className="text-edge" />
        <Link to="/loja/catalogo" className="transition-colors hover:text-gold">Catálogo</Link>
        {game && (
          <>
            <ChevronRight size={12} className="text-edge" />
            <span className="text-cream">{game.name}</span>
          </>
        )}
      </nav>

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-sand">
              {total} {total === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}
            </p>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-edge/60 px-3.5 py-2 text-[13px] font-bold text-gold lg:hidden"
        >
          <SlidersHorizontal size={15} /> Filtros
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-36">
            <FilterSidebar value={filters} onChange={updateParams} onReset={reset} totalResults={total} />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1">
          {/* Barra de ordenação */}
          <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-edge/40 bg-card/40 px-3 py-2">
            <span className="hidden items-center gap-1.5 text-[12px] font-semibold text-sand sm:flex">
              <SlidersHorizontal size={13} className="text-tang" />
              {filters.auto && <span className="rounded-md bg-tang/15 px-1.5 py-0.5 text-tang">Auto</span>}
              {filters.onlyAvailable && <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">Disponíveis</span>}
              {filters.minRating > 0 && <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-gold">★ {filters.minRating}+</span>}
              {isDeals && <span className="rounded-md bg-red-500/15 px-1.5 py-0.5 text-red-300">Ofertas</span>}
            </span>
            <label className="ml-auto flex items-center gap-2">
              <span className="text-[12px] font-semibold text-sand/70">Ordenar:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value as CatalogSort })}
                className="h-9 cursor-pointer rounded-lg border border-edge/60 bg-[#1b120d] px-2.5 text-[13px] font-medium text-white outline-none focus:border-tang"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <ProductGridSkeleton count={10} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch size={30} />}
              title="Nenhum anúncio encontrado"
              subtitle="Tente ajustar os filtros ou buscar por outro termo."
              action={
                <button
                  onClick={reset}
                  className="grad-btn rounded-xl px-5 py-2.5 font-display text-sm font-bold text-white"
                >
                  LIMPAR FILTROS
                </button>
              }
            />
          ) : (
            <>
              <ProductGrid products={products.slice(0, visible)} loading={false} />
              {visible < products.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    className="rounded-2xl border-2 border-edge/70 px-8 py-3 font-display text-sm font-bold tracking-wide text-gold transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/70 hover:bg-gold/10"
                  >
                    CARREGAR MAIS ({products.length - visible} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[84%] max-w-[320px] overflow-y-auto bg-coal p-4 store-scroll lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-white">
                  <Filter size={17} className="text-tang" /> Filtros
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge/60 text-sand"
                  aria-label="Fechar filtros"
                >
                  <X size={17} />
                </button>
              </div>
              <FilterSidebar
                value={filters}
                onChange={(patch) => {
                  updateParams(patch)
                  setMobileOpen(false)
                }}
                onReset={reset}
                totalResults={total}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}