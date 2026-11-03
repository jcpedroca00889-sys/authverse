import { useEffect, useState } from 'react'
import {
  BadgePercent,
  Blocks,
  Clock,
  PiggyBank,
  Rocket,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import HeroBanner from '../components/store/HeroBanner'
import CategoryStrip from '../components/store/CategoryStrip'
import SectionShelf from '../components/store/SectionShelf'
import { BannerSkeleton, CategorySkeleton } from '../components/store/Skeletons'
import { fetchHomeSections, type HomeSections } from '../services/catalog'

export default function HomePage() {
  const [sections, setSections] = useState<HomeSections | null>(null)

  useEffect(() => {
    let alive = true
    fetchHomeSections().then((s) => alive && setSections(s))
    return () => {
      alive = false
    }
  }, [])

  const loading = !sections

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-3 pb-4 pt-5 sm:px-6">
      {loading ? <BannerSkeleton /> : <HeroBanner />}
      {loading ? <CategorySkeleton /> : <CategoryStrip />}

      <SectionShelf
        id="destaques"
        title="Em destaque"
        icon={<Sparkles size={16} />}
        products={sections?.featured ?? []}
        loading={loading}
        query=""
      />
      <SectionShelf
        id="mais-vendidos"
        title="Mais vendidos"
        icon={<TrendingUp size={16} />}
        products={sections?.bestSellers ?? []}
        loading={loading}
        query="sort=best-sellers"
      />
      <SectionShelf
        id="ofertas"
        title="Ofertas imperdíveis"
        icon={<BadgePercent size={16} />}
        products={sections?.deals ?? []}
        loading={loading}
        query="ofertas=1"
      />
      <SectionShelf
        id="recentes"
        title="Recém-anunciados"
        icon={<Clock size={16} />}
        products={sections?.newest ?? []}
        loading={loading}
        query="sort=newest"
      />
      <SectionShelf
        id="menores-precos"
        title="Menores preços"
        icon={<PiggyBank size={16} />}
        products={sections?.cheapest ?? []}
        loading={loading}
        query="sort=price-asc"
      />
      <SectionShelf
        id="roblox-popular"
        title="Populares no Roblox"
        icon={<Blocks size={16} />}
        products={sections?.robloxPopular ?? []}
        loading={loading}
        query="jogo=roblox&sort=best-sellers"
      />
      <SectionShelf
        id="oportunidades"
        title="Oportunidades para gamers"
        icon={<Rocket size={16} />}
        products={sections?.opportunities ?? []}
        loading={loading}
        query="sort=rating"
      />
    </div>
  )
}