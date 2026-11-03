import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { GAMES } from '../../data/catalog'
import { getAllProducts } from '../../services/catalog'
import GameArt from './GameArt'

function CategoryStrip() {
  const counts = (() => {
    const all = getAllProducts()
    const map = new Map<string, number>()
    for (const p of all) map.set(p.game, (map.get(p.game) ?? 0) + 1)
    return map
  })()

  return (
    <section aria-label="Categorias populares">
      <div className="mb-4">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-white sm:text-[22px]">
          Categorias populares
        </h2>
        <div className="mt-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-ember to-gold" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {GAMES.map((g, i) => (
          <motion.div
            key={g.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link
              to={`/loja/categoria/${g.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-edge/50 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-tang/70 hover:shadow-[0_16px_40px_-14px_rgba(255,121,0,0.5)]"
            >
              <GameArt
                game={g.slug}
                variant={i}
                className="h-[96px] w-full sm:h-[104px]"
                emojiSize={40}
              />
              <div className="flex flex-1 items-center justify-between gap-1 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-[13px] font-bold text-white transition-colors group-hover:text-gold">
                    {g.name}
                  </p>
                  <p className="text-[11px] text-sand/70">
                    {counts.get(g.slug) ?? 0} anúncios
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-edge transition-all duration-300 group-hover:text-tang group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default memo(CategoryStrip)