import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../../../lib/mockAuth'
import {
  createListing,
  deleteListing,
  fetchSellerOrders,
  getMyListings,
  updateListing,
} from '../../../services/catalog'
import { useToasts } from '../../../state/StoreProviders'
import type { ListingInput, Order, Product, ProductStatus } from '../../../lib/types'

export type TabId = 'anunciar' | 'anuncios' | 'vendas'

export function useSellerDashboard() {
  const user = getCurrentUser()
  const { push } = useToasts()
  const [tab, setTab] = useState<TabId>('anunciar')
  const [listings, setListings] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)

  const reload = useCallback(() => {
    if (user) setListings(getMyListings(user.username))
  }, [user])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (tab === 'vendas' && user) {
      setLoadingOrders(true)
      fetchSellerOrders(user.username).then((o) => {
        setOrders(o)
        setLoadingOrders(false)
      })
    }
  }, [tab, user])

  const handleCreate = async (input: ListingInput) => {
    setSubmitting(true)
    try {
      const p = await createListing(user!.username, input)
      push('success', 'Anúncio publicado! 🎉', p.title)
      setTab('anuncios')
      reload()
    } catch {
      push('error', 'Falha ao publicar', 'Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (input: ListingInput) => {
    if (!editing) return
    setSubmitting(true)
    try {
      await updateListing(editing.id, input)
      push('success', 'Anúncio atualizado', editing.title)
      setEditing(null)
      reload()
    } catch {
      push('error', 'Falha ao atualizar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteListing(id)
    push('info', 'Anúncio excluído')
    setConfirmDelete(null)
    reload()
  }

  const toggleStatus = async (p: Product) => {
    const next: ProductStatus = p.status === 'paused' ? 'available' : 'paused'
    await updateListing(p.id, { status: next })
    push('info', next === 'paused' ? 'Anúncio pausado' : 'Anúncio reativado')
    reload()
  }

  return {
    user,
    tab,
    setTab,
    listings,
    orders,
    submitting,
    editing,
    setEditing,
    confirmDelete,
    setConfirmDelete,
    loadingOrders,
    handleCreate,
    handleUpdate,
    handleDelete,
    toggleStatus,
  }
}