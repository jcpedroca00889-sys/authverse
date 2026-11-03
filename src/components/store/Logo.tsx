import { Link } from 'react-router-dom'
import { Banana } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  to?: string
}

/** Logo MONKEY LARANJA com o ícone da banana. */
export default function Logo({ size = 'md', to = '/loja' }: LogoProps) {
  const dims = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
  const text = { sm: 'text-[15px]', md: 'text-lg', lg: 'text-[22px]' }
  const sub = { sm: 'text-[8px]', md: 'text-[9px]', lg: 'text-[10px]' }

  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="MONKEY LARANJA — página inicial">
      <span
        className={`grad-btn flex items-center justify-center rounded-2xl shadow-[0_10px_24px_-8px_rgba(255,121,0,0.7)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105 ${dims[size]} w-auto px-2`}
      >
        <Banana size={size === 'lg' ? 28 : size === 'md' ? 22 : 18} className="text-white drop-shadow" />
      </span>
      <span className="leading-none">
        <span className={`font-display block font-extrabold tracking-[0.04em] text-white ${text[size]}`}>
          MONKEY
        </span>
        <span
          className={`text-gradient-gold font-display block font-bold tracking-[0.34em] ${sub[size]}`}
        >
          LARANJA
        </span>
      </span>
    </Link>
  )
}