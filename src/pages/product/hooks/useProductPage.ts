import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchProductById, fetchRelated } from '../../services/catalog'
import { discountPct, gameBySlug, sellerByUsername } from '../../data/catalog'
import { useCart, useFavorites, useToasts } from '../../state/StoreProviders'
import type { Product } from '../../lib/types'

export function useProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add } = useCart()
  const { has, toggle } = useFavorites()
  const { push } = useToasts()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  useEffect(() => {
    let alive = true
    setLoading(true)
    window.scrollTo({ top: 0 })
    setGalleryIdx(0)
    setQty(1)
    fetchProductById(id ?? '').then(async (p) => {
      if (!alive) return
      setProduct(p)
      setLoading(false)
      if (p) {
        const rel = await fetchRelated(p, 5)
        if (alive) setRelated(rel)
      }
    })
    return () => { alive = false }
  }, [id])

  const game = product ? gameBySlug(product.game) : null
  const seller = product ? sellerByUsername(product.sellerUsername) : null
  const discount = product ? discountPct(product) : 0
  const fav = product ? has(product.id) : false

  const galleryVariants = useMemo(() => [0, 2, 5], [])

  const buyNow = () => {
    add(product!, qty)
    navigate('/loja/checkout')
  }

  const addToCart = () => {
    add(product!, qty)
    push('success', 'Adicionado ao carrinho! 🛒', `${qty}x ${product!.title}`)
  }

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewText.trim().length < 10) {
      push('error', 'Avaliação muito curta', 'Escreva pelo menos 10 caracteres.')
      return
    }
    push('success', 'Avaliação enviada! ⭐', 'Obrigado por contribuir com a comunidade.')
    setReviewText('')
    setReviewRating(5)
  }

  const report = () => {
    push('info', 'Denúncia registrada', 'Nossa equipe vai analisar o anúncio em até 24h.')
  }

  return {
    product, related, loading, galleryIdx, setGalleryIdx,
    qty, setQty, reviewText, setReviewText, reviewRating, setReviewRating,
    game, seller, discount, fav, galleryVariants,
    buyNow, addToCart, submitReview, report,
  }
}