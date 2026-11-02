import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, BadgePercent, ChevronDown, Loader2, LogOut, RefreshCw, Search, ShoppingBag,
  Sparkles, Star, X,
} from 'lucide-react';
import BrandMark from '../components/store/BrandMark';
import HoloCard from '../components/HoloCard';
import ProductArt from '../components/store/ProductArt';
import ProductCard from '../components/store/ProductCard';
import ProductModal from '../components/store/ProductModal';
import StoreNav from '../components/store/StoreNav';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { usePrefs } from '../hooks/usePrefs';
import {
  brl, fetchProducts, CATEGORIES, SORTS, TYPES, categoriesOf, typeLabel, categoryLabel,
  type Category, type Product, type ProductType, type SortKey,
} from '../services/store';

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="aspect-[4/3] animate-pulse bg-white/[0.05]" />
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-2.5 w-full animate-pulse rounded bg-white/10" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function Store() {
  const { user, logout } = useAuth();
  const { reduce } = usePrefs();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  const [category, setCategory] = useState<Category | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [quick, setQuick] = useState<Product | null>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = 'AUTHVERSE · Store';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    setLoading(true);
    fetchProducts(ctrl.signal)
      .then((list) => {
        if (!alive) return;
        setProducts(list);
        setError('');
      })
      .catch((e) => {
        if (!alive || (e as Error).name === 'AbortError') return;
        setError((e as Error).message);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; ctrl.abort(); };
  }, [reload]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: products.length };
    for (const p of products) m[p.category] = (m[p.category] ?? 0) + 1;
    return m;
  }, [products]);

  /** Categorias visíveis de acordo com o tipo selecionado na navegação. */
  const activeCategories = useMemo(() =>
    typeFilter === 'all'
      ? CATEGORIES.filter((c) => c.id !== 'all').map((c) => c.id)
      : categoriesOf(typeFilter),
  [typeFilter]);

  /** Produtos do tipo selecionado (antes do filtro de categoria/texto). */
  const base = useMemo(() => products.filter((p) => activeCategories.includes(p.category)), [products, activeCategories]);

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of base) m[p.category] = (m[p.category] ?? 0) + 1;
    return m;
  }, [base]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const items = base.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!term || `${p.name} ${p.tagline} ${p.tags.join(' ')}`.toLowerCase().includes(term)),
    );
    switch (sort) {
      case 'newest': return [...items].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
      case 'priceAsc': return [...items].sort((a, b) => a.price - b.price);
      case 'priceDesc': return [...items].sort((a, b) => b.price - a.price);
      case 'rating': return [...items].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      default: return [...items].sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
  }, [base, category, q, sort]);

  /** Agrupamento dos produtos filtrados por categoria (visão organizada do catálogo). */
  const grouped = useMemo(() => {
    const byCat: Record<string, Product[]> = {};
    for (const p of filtered) (byCat[p.category] ??= []).push(p);
    return activeCategories.flatMap((c) => {
      const ps = byCat[c];
      return ps ? [{ category: c, products: ps }] : [];
    });
  }, [filtered, activeCategories]);

  const featured = products.find((p) => p.featured) ?? products[0];
  const avg = products.length ? products.reduce((s, p) => s + p.rating, 0) / products.length : 0;
  const maxOff = products.reduce(
    (best, p) => (p.category === 'packs' && p.oldPrice ? Math.max(best, Math.round((1 - p.price / p.oldPrice) * 100)) : best),
    0,
  );

  const goCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  const navigate = (c: Category | 'all') => { setCategory(c); goCatalog(); };
  const out = async () => {
    await logout();
    toast('success', 'Sessão encerrada com segurança.');
  };

  if (!user) return null;

  return (
    <motion.main
      id="topo"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 min-h-screen"
    >
      <StoreNav user={user} onLogout={out} onFilter={(f) => setTypeFilter(f as ProductType | 'all')} activeFilter={typeFilter} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">
              <Sparkles size={12} /> Loja de ativos digitais
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.35rem]">
              Seu universo digital,
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-200 bg-clip-text text-transparent">
                sem limites.
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              Skins, templates, packs e assinaturas selecionados para criadores. Entrega instantânea,
              licença comercial e atualizações para sempre.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={goCatalog}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-8px_rgba(99,102,241,.9)] transition hover:brightness-110"
              >
                Explorar catálogo
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('packs')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
              >
                <ShoppingBag size={16} /> Ver packs
              </button>
            </div>

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                { v: products.length ? String(products.length) : '—', l: 'produtos' },
                { v: avg ? avg.toFixed(1) : '—', l: 'média ★' },
                { v: 'Imediata', l: 'entrega' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                  <dt className="text-[10px] uppercase tracking-[.18em] text-slate-500">{s.l}</dt>
                  <dd className="mt-0.5 text-lg font-bold text-slate-100">{s.v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Destaque */}
          <div className="relative">
            {featured ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 22, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 90, damping: 18 }}
                style={{ perspective: 1200 }}
              >
                <HoloCard className="p-4 sm:p-5">
                  <ProductArt
                    glyph={featured.glyph}
                    accent={featured.accent}
                    className="group aspect-[16/10] rounded-xl border border-white/10"
                  />
                  <div className="mt-4 flex items-start justify-between gap-3 px-1">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[.2em] text-cyan-300/80">Destaque da semana</p>
                      <h2 className="truncate text-lg font-semibold text-white">{featured.name}</h2>
                      <p className="truncate text-xs text-slate-400">{featured.tagline}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {featured.oldPrice && (
                        <p className="text-[10px] text-slate-500 line-through">{brl(featured.oldPrice)}</p>
                      )}
                      <p className="text-lg font-bold text-white">{brl(featured.price)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuick(featured)}
                    className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.06] py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
                  >
                    Ver detalhes
                  </button>
                </HoloCard>
              </motion.div>
            ) : (
              <div className="glass h-[340px] animate-pulse" />
            )}

            <motion.span
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-3 top-8 hidden rounded-full border border-emerald-400/40 bg-[#06110e]/90 px-3 py-1 text-[10px] font-semibold text-emerald-200 shadow-lg backdrop-blur sm:block"
            >
              ⚡ Entrega instantânea
            </motion.span>
            <motion.span
              animate={reduce ? undefined : { y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-2 bottom-16 hidden items-center gap-1 rounded-full border border-amber-400/40 bg-[#120d05]/90 px-3 py-1 text-[10px] font-semibold text-amber-200 shadow-lg backdrop-blur sm:flex"
            >
              <Star size={11} className="fill-amber-300 text-amber-300" />
              {avg ? avg.toFixed(1) : '—'} de média
            </motion.span>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 pt-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[.25em] text-cyan-300/80">Catálogo</p>
            <h2 className="text-2xl font-bold text-white">Ativos digitais</h2>
          </div>
          <p className="text-xs text-slate-500">
            {filtered.length} produto{filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* tipos */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              typeFilter === 'all'
                ? 'border-transparent bg-violet-600 text-white shadow-[0_0_20px_-8px_rgba(139,92,246,.7)]'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                typeFilter === t.id
                  ? 'border-transparent bg-violet-600 text-white shadow-[0_0_20px_-8px_rgba(139,92,246,.7)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* categorias (dentro do tipo selecionado) */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeCategories.map((c) => {
            const on = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => { navigate(c); setQ(''); }}
                aria-pressed={on}
                className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  on
                    ? 'border-transparent text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId={`cat-pill-${c}`}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 shadow-[0_0_22px_-6px_rgba(99,102,241,.9)]"
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  />
                )}
                <span className="relative z-10">{categoryLabel(c)}</span>
                <span className={`relative z-10 ml-1.5 text-[10px] ${on ? 'text-white/70' : 'text-slate-500'}`}>
                  {typeCounts[c] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* oferta */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600/25 via-blue-600/10 to-cyan-500/20 p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-amber-200">
                <BadgePercent size={18} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-amber-200">Oferta da semana</p>
                <h3 className="text-sm font-semibold text-slate-100 sm:text-base">
                  Até {maxOff}% off em packs selecionados
                </h3>
                <p className="text-xs text-slate-400">Combine assets e economize no Creator Pack.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setCategory('packs'); setSort('priceAsc'); goCatalog(); }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-amber-300/50 hover:text-amber-200"
            >
              Ver packs <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* busca + ordenação */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar no catálogo…"
              aria-label="Buscar no catálogo"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-9 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:shadow-[0_0_22px_-6px_rgba(34,211,238,.7)]"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-slate-200"
              >
                <X size={13} />
              </button>
            )}
          </label>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-slate-500 sm:block">Ordenar por</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Ordenar produtos"
                className="appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-3 pr-9 text-xs text-slate-200 outline-none transition focus:border-cyan-400/70"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0b0720]">{s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        {/* linhas roláveis por categoria */}
        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-8 text-center">
            <p className="text-sm text-rose-200">{error}</p>
            <button
              type="button"
              onClick={() => setReload((r) => r + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-rose-300/40"
            >
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-400">
              <Search size={18} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-200">Nenhum produto encontrado</h3>
            <p className="mt-1 text-xs text-slate-500">Tente outra busca ou remova os filtros.</p>
            <button
              type="button"
              onClick={() => { setQ(''); setCategory('all'); }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
            >
              Limpar filtros
            </button>
          </div>
        ) : category === 'all' ? (
          <>
            {grouped.map((g) => (
              <section key={g.category} className="mt-12 first:mt-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] uppercase tracking-[.25em] text-cyan-300/80">
                    {categoryLabel(g.category)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {g.products.length} produto{g.products.length === 1 ? '' : 's'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { navigate(g.category); setQ(''); }}
                      className="text-xs font-medium text-cyan-300 transition underline underline-offset-4 hover:text-cyan-200"
                    >
                      Ver todos →
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto scroll-snap-x pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
                  {g.products.map((p) => (
                    <ProductCard key={p.id} product={p} onQuickView={setQuick} />
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{categoryLabel(category)}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {filtered.length} produto{filtered.length === 1 ? '' : 's'} nesta categoria
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setCategory('all'); setQ(''); goCatalog(); }}
                className="text-xs font-medium text-cyan-300 transition underline underline-offset-4 hover:text-cyan-200"
              >
                Voltar ao catálogo →
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto scroll-snap-x pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuick} />
              ))}
            </div>
          </section>
        )}
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-[#05030f]/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-slate-300">
            <BrandMark className="h-6 w-6" />
            <span className="font-semibold tracking-[.2em]">AUTHVERSE</span>
            <span className="text-slate-600">store</span>
          </div>
          <p>
            Sessão protegida por cookie HttpOnly · {user.username} · desde{' '}
            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
          </p>
          <button type="button" onClick={out} className="inline-flex items-center gap-2 text-slate-400 transition hover:text-rose-200">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {quick && <ProductModal product={quick} onClose={() => setQuick(null)} />}
      </AnimatePresence>
    </motion.main>
  );
}
