import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Trash2, Edit, Search, X, Loader2, AlertCircle, CheckCircle,
  ChevronDown, Save, LayoutGrid, ArrowLeft,
} from 'lucide-react';
import HoloCard from '../components/HoloCard';
import TextField from '../components/TextField';
import MagneticButton from '../components/MagneticButton';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { usePrefs } from '../hooks/usePrefs';
import { api } from '../services/api';
import {
  CATEGORIES, SORTS, brl,
  type Category, type SortKey, type Accent, type Glyph, type Product,
} from '../services/store';

const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'violet', label: 'Violeta', color: '#a855f7' },
  { id: 'cyan', label: 'Ciano', color: '#22d3ee' },
  { id: 'blue', label: 'Azul', color: '#3b82f6' },
  { id: 'fuchsia', label: 'Fúcsia', color: '#d946ef' },
  { id: 'emerald', label: 'Esmeralda', color: '#10b981' },
  { id: 'amber', label: 'Âmbar', color: '#f59e0b' },
];

const GLYPHS: { id: Glyph; label: string }[] = [
  { id: 'orb', label: 'Orbe' },
  { id: 'cube', label: 'Cubo' },
  { id: 'ring', label: 'Anel' },
  { id: 'grid', label: 'Grade' },
  { id: 'wave', label: 'Onda' },
  { id: 'prism', label: 'Prisma' },
  { id: 'bolt', label: 'Raio' },
  { id: 'layers', label: 'Camadas' },
];

const BADGES = [null, 'Novo', 'Top', 'Oferta'];

function SelectField({ label, value, onChange, options, error, className = '' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none w-full rounded-xl border bg-white/[0.04] py-2.5 pl-3 pr-9 text-sm text-slate-100 outline-none transition ${
            error ? 'border-rose-400/50 focus:border-rose-400' : 'border-white/10 focus:border-cyan-400/70'
          }`}
        >
          {options.map((o) => <option key={o.value} value={o.value} className="bg-[#0b0720]">{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function BadgeSelector({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BADGES.map((b) => (
        <button
          key={b ?? 'none'}
          type="button"
          onClick={() => onChange(b)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            value === b
              ? 'bg-violet-600 text-white shadow-[0_0_20px_-8px_rgba(139,92,246,.7)]'
              : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
          }`}
        >
          {b ?? 'Sem badge'}
        </button>
      ))}
    </div>
  );
}

function AccentSelector({ value, onChange }: { value: Accent; onChange: (v: Accent) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onChange(a.id)}
          className={`relative rounded-xl border p-3 text-center transition ${
            value === a.id
              ? 'border-transparent bg-white/10 shadow-[0_0_20px_-8px_rgba(139,92,246,.7)]'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
          }`}
        >
          <div
            className="w-6 h-6 mx-auto rounded-full mb-1"
            style={{ background: a.color, boxShadow: `0 0 12px ${a.color}` }}
          />
          <span className="text-xs font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function GlyphSelector({ value, onChange }: { value: Glyph; onChange: (v: Glyph) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GLYPHS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(g.id)}
          className={`rounded-xl border p-3 text-center text-sm font-medium transition ${
            value === g.id
              ? 'border-transparent bg-violet-600 text-white shadow-[0_0_20px_-8px_rgba(139,92,246,.7)]'
              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
          }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

function TagInput({ label, value, onChange, error }: { label: string; value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [input, setInput] = useState('');
  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
    if (e.key === 'Backspace' && !input && value.length > 0) onChange(value.slice(0, -1));
  };
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((t, i) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-200">
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          placeholder="Adicionar tag + Enter"
          className="flex-1 min-w-[120px] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70"
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function ProductForm({ product, onSubmit, onCancel, loading }: {
  product: Partial<Product> | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'skins' as Category,
    price: 0,
    oldPrice: '',
    rating: 0,
    reviews: 0,
    badge: null as string | null,
    accent: 'violet' as Accent,
    glyph: 'orb' as Glyph,
    meta: '',
    period: '',
    tags: [] as string[],
    features: [] as string[],
    featured: false,
    releasedAt: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        tagline: product.tagline ?? '',
        description: product.description ?? '',
        category: product.category ?? 'skins',
        price: product.price ?? 0,
        oldPrice: product.oldPrice ?? '',
        rating: product.rating ?? 0,
        reviews: product.reviews ?? 0,
        badge: product.badge ?? null,
        accent: product.accent ?? 'violet',
        glyph: product.glyph ?? 'orb',
        meta: product.meta ?? '',
        period: product.period ?? '',
        tags: product.tags ?? [],
        features: product.features ?? [],
        featured: product.featured ?? false,
        releasedAt: product.releasedAt ?? new Date().toISOString().split('T')[0],
      });
    } else {
      setForm({
        name: '', tagline: '', description: '', category: 'skins', price: 0, oldPrice: '',
        rating: 0, reviews: 0, badge: null, accent: 'violet', glyph: 'orb', meta: '',
        period: '', tags: [], features: [], featured: false, releasedAt: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [product]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.tagline.trim()) newErrors.tagline = 'Tagline é obrigatório';
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!form.category) newErrors.category = 'Categoria é obrigatória';
    if (form.price <= 0) newErrors.price = 'Preço deve ser maior que zero';
    if (form.oldPrice && parseFloat(form.oldPrice) <= form.price) newErrors.oldPrice = 'Preço antigo deve ser maior que o atual';
    if (!form.accent) newErrors.accent = 'Acento é obrigatório';
    if (!form.glyph) newErrors.glyph = 'Glifo é obrigatório';
    if (!form.meta.trim()) newErrors.meta = 'Meta é obrigatório';
    if (form.tags.length === 0) newErrors.tags = 'Pelo menos uma tag é obrigatória';
    if (form.features.length === 0) newErrors.features = 'Pelo menos uma feature é obrigatória';
    if (form.rating < 0 || form.rating > 5) newErrors.rating = 'Rating deve ser entre 0 e 5';
    if (form.reviews < 0) newErrors.reviews = 'Reviews não pode ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
      rating: parseFloat(form.rating.toFixed(1)),
      reviews: Math.floor(form.reviews),
      price: parseFloat(form.price.toFixed(2)),
      badge: form.badge,
      period: form.period || undefined,
    };
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 glass w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
            <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-200 transition"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} placeholder="Ex: Nebula Overlay" maxLength={60} />
              <TextField label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} error={errors.tagline} placeholder="Curta descrição de impacto" maxLength={100} />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition ${errors.description ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/70'}`}
                placeholder="Descrição completa do produto..."
              />
              {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField label="Categoria" value={form.category} onChange={(v) => setForm({ ...form, category: v as Category })}
                options={CATEGORIES.filter(c => c.id !== 'all').map(c => ({ value: c.id, label: c.label }))} error={errors.category} />
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preço (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition ${errors.price ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/70'}`}
                />
                {errors.price && <p className="mt-1 text-xs text-rose-400">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preço Antigo (R$) <span className="text-slate-500">(opcional)</span></label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition border-white/10 focus:border-cyan-400/70`}
                />
                {errors.oldPrice && <p className="mt-1 text-xs text-rose-400">{errors.oldPrice}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rating (0-5)</label>
                <input
                  type="number" step="0.1" min="0" max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                  className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition ${errors.rating ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/70'}`}
                />
                {errors.rating && <p className="mt-1 text-xs text-rose-400">{errors.rating}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reviews</label>
                <input
                  type="number" min="0"
                  value={form.reviews}
                  onChange={(e) => setForm({ ...form, reviews: parseInt(e.target.value) || 0 })}
                  className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition ${errors.reviews ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/70'}`}
                />
                {errors.reviews && <p className="mt-1 text-xs text-rose-400">{errors.reviews}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Data de Lançamento</label>
                <input
                  type="date"
                  value={form.releasedAt}
                  onChange={(e) => setForm({ ...form, releasedAt: e.target.value })}
                  className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 outline-none transition border-white/10 focus:border-cyan-400/70`}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Acento</label>
                <AccentSelector value={form.accent} onChange={(v) => setForm({ ...form, accent: v })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Glifo</label>
                <GlyphSelector value={form.glyph} onChange={(v) => setForm({ ...form, glyph: v })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Meta" value={form.meta} onChange={(v) => setForm({ ...form, meta: v })} error={errors.meta} placeholder="Ex: OBS · 4 layouts" maxLength={40} />
              <TextField label="Período" value={form.period} onChange={(v) => setForm({ ...form, period: v })} placeholder="Ex: mês, ano (para assinaturas)" maxLength={20} />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Badge</label>
              <BadgeSelector value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} />
            </div>

            <TagInput label="Tags" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} error={errors.tags} />
            <TagInput label="Features" value={form.features} onChange={(v) => setForm({ ...form, features: v })} error={errors.features} />

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/[0.04] text-violet-500 focus:ring-violet-500" />
              <span className="text-sm text-slate-200">Destacar na home (featured)</span>
            </label>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200">Cancelar</button>
              <MagneticButton type="submit" loading={loading} className="flex-1">
                <Save size={16} className="mr-2" /> {isEdit ? 'Salvar Alterações' : 'Criar Produto'}
              </MagneticButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, loading, variant = 'danger' }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading: boolean;
  variant?: 'danger' | 'warning';
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      >
        <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 glass w-full max-w-md p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {variant === 'danger' ? <AlertCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-slate-300 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200">Cancelar</button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                variant === 'danger'
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white hover:brightness-110'
              }`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle size={16} /> Confirmar</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { reduce } = usePrefs();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check if user is admin (from JWT claim)
  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!isAdmin) {
      toast('error', 'Acesso negado. Apenas administradores.');
      return;
    }
    loadProducts();
  }, [user, authLoading]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.list();
      setProducts(data.products ?? []);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    setFormLoading(true);
    try {
      await api.products.create(data);
      toast('success', 'Produto criado com sucesso!');
      setShowForm(false);
      loadProducts();
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingProduct) return;
    setFormLoading(true);
    try {
      await api.products.update(editingProduct.id, data);
      toast('success', 'Produto atualizado com sucesso!');
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.products.delete(deleteConfirm.id);
      toast('success', 'Produto removido com sucesso!');
      setDeleteConfirm(null);
      loadProducts();
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(p =>
      (category === 'all' || p.category === category) &&
      (!term || `${p.name} ${p.tagline} ${p.tags.join(' ')}`.toLowerCase().includes(term))
    ).sort((a, b) => {
      switch (sort) {
        case 'newest': return b.releasedAt.localeCompare(a.releasedAt);
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'rating': return b.rating - a.rating || b.reviews - a.reviews;
        default: return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
      }
    });
  }, [products, category, q, sort]);

  const stats = useMemo(() => ({
    total: products.length,
    featured: products.filter(p => p.featured).length,
    categories: [...new Set(products.map(p => p.category))].length,
    avgPrice: products.length ? products.reduce((s, p) => s + p.price, 0) / products.length : 0,
  }), [products]);

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <HoloCard className="w-full max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-slate-400">Esta área é restrita a administradores.</p>
        </HoloCard>
      </div>
    );
  }

  return (
    <motion.main
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 min-h-screen"
    >
      {/* Header */}
      <header className="border-b border-white/10 bg-[#05030f]/60 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Painel Admin</h1>
              <p className="text-xs text-slate-500">Gerenciamento de produtos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
            >
              <ArrowLeft size={14} /> Voltar à loja
            </button>
            <span className="text-xs text-slate-400 hidden sm:block">Admin: {user.username}</span>
            <MagneticButton onClick={() => setShowForm(true)} className="gap-2">
              <Plus size={16} /> Novo Produto
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total de Produtos', value: stats.total, icon: '📦' },
            { label: 'Em Destaque', value: stats.featured, icon: '⭐' },
            { label: 'Categorias', value: stats.categories, icon: '📁' },
            { label: 'Preço Médio', value: brl(stats.avgPrice), icon: '💰' },
          ].map((s) => (
            <HoloCard key={s.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[.2em] text-slate-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </HoloCard>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1 sm:max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-9 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70"
              />
              {q && <button type="button" onClick={() => setQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"><X size={13} /></button>}
            </label>
            <SelectField label="Categoria" value={category} onChange={(v) => setCategory(v as Category | 'all')}
              options={[{ value: 'all', label: 'Todas' }, ...CATEGORIES.filter(c => c.id !== 'all').map(c => ({ value: c.id, label: c.label }))]}
              className="w-48" />
            <SelectField label="Ordenar" value={sort} onChange={(v) => setSort(v as SortKey)}
              options={SORTS.map(s => ({ value: s.id, label: s.label }))}
              className="w-48" />
          </div>
          <p className="text-xs text-slate-500">{filtered.length} de {products.length} produtos</p>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" /></div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum produto encontrado</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-3 text-left text-[10px] uppercase tracking-[.2em] text-slate-500">Produto</th>
                  <th className="p-3 text-left text-[10px] uppercase tracking-[.2em] text-slate-500 hidden md:table-cell">Categoria</th>
                  <th className="p-3 text-right text-[10px] uppercase tracking-[.2em] text-slate-500 hidden lg:table-cell">Preço</th>
                  <th className="p-3 text-center text-[10px] uppercase tracking-[.2em] text-slate-500 hidden lg:table-cell">Rating</th>
                  <th className="p-3 text-center text-[10px] uppercase tracking-[.2em] text-slate-500">Status</th>
                  <th className="p-3 text-right text-[10px] uppercase tracking-[.2em] text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 grid place-items-center">
                          <span className="text-2xl">{p.glyph === 'orb' ? '●' : p.glyph === 'cube' ? '■' : p.glyph === 'ring' ? '○' : '◆'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{p.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{p.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        {CATEGORIES.find(c => c.id === p.category)?.label}
                      </span>
                    </td>
                    <td className="p-3 text-right hidden lg:table-cell font-mono text-slate-200">{brl(p.price)}</td>
                    <td className="p-3 text-center hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <span className="text-amber-400">★</span> {p.rating.toFixed(1)} ({p.reviews})
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {p.featured && <span className="rounded-full bg-violet-500/20 text-violet-300 px-2 py-0.5 text-[10px] font-semibold">★ Destaque</span>}
                        {p.oldPrice && (p.oldPrice > p.price) && <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">↓ Promo</span>}
                        {p.badge && <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-semibold">{p.badge}</span>}
                        {!p.featured && !p.oldPrice && !p.badge && <span className="text-slate-500 text-[10px]">Normal</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingProduct(p); setShowForm(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition"
                          title="Editar"
                        ><Edit size={16} /></button>
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                          title="Excluir"
                        ><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductForm
        product={editingProduct}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        loading={formLoading}
      />
      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${deleteConfirm?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteLoading}
        variant="danger"
      />
    </motion.main>
  );
}