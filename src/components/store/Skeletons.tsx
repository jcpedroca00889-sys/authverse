import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import type { ReactNode } from 'react'

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-edge/40 bg-card/70">
      <div className="relative aspect-[4/3] animate-pulse bg-[#2c1d13]" />
      <div className="space-y-2.5 p-3.5">
        <div className="h-3.5 w-11/12 animate-pulse rounded-md bg-[#2c1d13]" />
        <div className="h-3 w-16 animate-pulse rounded-md bg-[#2c1d13]" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-20 animate-pulse rounded-md bg-[#2c1d13]" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-[#2c1d13]" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BannerSkeleton() {
  return (
    <div className="relative h-64 animate-pulse overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c1d13] to-[#24170f] sm:h-80 lg:h-[420px]" />
  )
}

export function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="h-[118px] animate-pulse rounded-2xl bg-[#2c1d13]" />
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-edge/70 bg-card/40 px-6 py-14 text-center"
    >
      <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-edge/60 bg-[#1b120d] text-tang">
        {icon ?? <PackageSearch size={30} />}
      </span>
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm leading-relaxed text-sand">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}