import Avatar from '../../../components/store/Avatar'

interface Props {
  username: string
}

export function SellerHeader({ username }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Área do vendedor</h1>
        <p className="mt-1 text-sm text-sand">
          Publique anúncios e acompanhe suas vendas — tudo em um só lugar.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-edge/50 bg-card/60 px-4 py-2.5">
        <Avatar name={username} size={32} />
        <div>
          <p className="font-display text-[13px] font-bold leading-tight text-white">@{username}</p>
          <p className="text-[10.5px] uppercase tracking-wide text-sand/60">Vendedor</p>
        </div>
      </div>
    </div>
  )
}