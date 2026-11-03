import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { DeliveryTypeSelector } from './DeliveryTypeSelector'
import { EmojiPicker } from './EmojiPicker'
import { ListingPreview } from './ListingPreview'
import { CATEGORIES, GAMES } from '../../../data/catalog'
import type { DeliveryType, GameSlug, ListingInput, Product } from '../../../lib/types'

interface ListingFormProps {
  initial?: Product
  submitting: boolean
  onSubmit: (input: ListingInput) => void
  onCancel?: () => void
}

export function ListingForm({ initial, submitting, onSubmit, onCancel }: ListingFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    game: (initial?.game ?? 'roblox') as GameSlug,
    category: initial?.category ?? 'Contas',
    price: initial ? String(initial.price) : '',
    oldPrice: initial?.oldPrice ? String(initial.oldPrice) : '',
    stock: initial ? String(initial.stock) : '1',
    delivery: (initial?.delivery ?? 'automatic') as DeliveryType,
    description: initial?.description ?? '',
    emoji: initial?.emoji ?? '🧑‍🚀',
    art: initial?.art ?? 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.title.trim().length < 8) errs.title = 'Título com pelo menos 8 caracteres'
    const price = Number(form.price)
    if (!price || price <= 0) errs.price = 'Informe um preço válido'
    if (form.description.trim().length < 20) errs.description = 'Descreva o produto com pelo menos 20 caracteres'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onSubmit({
      title: form.title.trim(),
      game: form.game,
      category: form.category,
      price,
      oldPrice: form.oldPrice ? Number(form.oldPrice) || undefined : undefined,
      stock: Math.max(1, Number(form.stock) || 1),
      delivery: form.delivery,
      description: form.description.trim(),
      emoji: form.emoji,
      art: form.art,
    })
  }

  const inputCls =
    'h-11 w-full rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 text-sm text-white outline-none placeholder:text-sand/40 focus:border-tang transition-colors'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-cream/90'
  const errCls = 'mt-1 text-[11px] font-medium text-red-400'

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left column — fields */}
      <div className="space-y-4 rounded-3xl border border-edge/50 bg-card/60 p-5 sm:p-6">
        <div>
          <label className={labelCls}>Título do anúncio *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder="Ex.: Conta Roblox com itens raros e robux" className={inputCls} />
          {errors.title && <p className={errCls}>{errors.title}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Jogo *</label>
            <select value={form.game} onChange={(e) => set('game', e.target.value as GameSlug)} className={inputCls + ' cursor-pointer'}>
              {GAMES.map((g) => (<option key={g.slug} value={g.slug}>{g.name}</option>))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Categoria *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls + ' cursor-pointer'}>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Preço (R$) *</label>
            <input type="number" min={0} step="0.01" value={form.price}
              onChange={(e) => set('price', e.target.value)} placeholder="49,90" className={inputCls} />
            {errors.price && <p className={errCls}>{errors.price}</p>}
          </div>
          <div>
            <label className={labelCls}>Preço antigo (opcional)</label>
            <input type="number" min={0} step="0.01" value={form.oldPrice}
              onChange={(e) => set('oldPrice', e.target.value)} placeholder="Mostra o desconto" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Estoque</label>
            <input type="number" min={1} value={form.stock}
              onChange={(e) => set('stock', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Tipo de entrega *</label>
          <DeliveryTypeSelector value={form.delivery} onChange={(v) => set('delivery', v)} />
        </div>

        <div>
          <label className={labelCls}>Descrição *</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            rows={5}
            placeholder="Descreva tudo o que está incluso, condições de entrega, garantia..."
            className="w-full resize-y rounded-xl border border-edge/60 bg-[#1b120d] px-3.5 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-sand/40 focus:border-tang transition-colors" />
          {errors.description && <p className={errCls}>{errors.description}</p>}
        </div>
      </div>

      {/* Right column — preview + emoji + submit */}
      <div className="space-y-4">
        <ListingPreview
          game={form.game} emoji={form.emoji} art={form.art}
          title={form.title} price={form.price}
          onCycleArt={() => set('art', (form.art + 1) % 8)}
        />

        <div className="rounded-3xl border border-edge/50 bg-card/60 p-5">
          <p className="mb-2 text-xs font-semibold text-cream/90">Ilustração do produto</p>
          <EmojiPicker value={form.emoji} onChange={(v) => set('emoji', v)} />
        </div>

        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            type="submit"
            className="grad-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[15px] font-extrabold tracking-wide text-white shadow-[0_14px_32px_-10px_rgba(255,121,0,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : initial ? <Pencil size={17} /> : <Plus size={18} />}
            {submitting ? 'SALVANDO...' : initial ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR ANÚNCIO'}
          </motion.button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="rounded-2xl border border-edge/60 py-3 text-[13px] font-bold text-sand transition-colors hover:border-red-400/50 hover:text-red-300">
              CANCELAR EDIÇÃO
            </button>
          )}
        </div>
      </div>
    </form>
  )
}