export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <div className="h-4 w-72 animate-pulse rounded bg-[#2c1d13]" />
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="aspect-square animate-pulse rounded-3xl bg-[#2c1d13]" />
        <div className="space-y-4">
          <div className="h-6 w-full animate-pulse rounded bg-[#2c1d13]" />
          <div className="h-10 w-40 animate-pulse rounded bg-[#2c1d13]" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-[#2c1d13]" />
        </div>
      </div>
    </div>
  )
}