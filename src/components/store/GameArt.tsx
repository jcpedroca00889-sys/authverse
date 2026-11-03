import { memo } from 'react'
import {
  Apple,
  Blocks,
  Crosshair,
  Flame,
  Flower2,
  Gamepad2,
  Joystick,
  Pickaxe,
  Star,
  Zap,
} from 'lucide-react'
import { gameBySlug } from '../../data/catalog'
import type { GameSlug } from '../../lib/types'

const ICONS = {
  roblox: Blocks,
  'free-fire': Flame,
  valorant: Crosshair,
  fortnite: Zap,
  minecraft: Pickaxe,
  'gta-v': Star,
  steam: Joystick,
  'blox-fruits': Apple,
  'grow-a-garden': Flower2,
  outros: Gamepad2,
} as const

interface GameArtProps {
  game: GameSlug
  emoji?: string
  variant?: number
  className?: string
  emojiSize?: number
}

/**
 * Arte ilustrativa de produto — gradiente temático do jogo,
 * emblema em marca d'água, brilhos e o emoji do produto.
 * 100% local (sem imagens externas), leve e consistente.
 */
function GameArt({ game, emoji, variant = 0, className = '', emojiSize = 48 }: GameArtProps) {
  const g = gameBySlug(game)
  const Icon = ICONS[game]
  const v = Math.abs(variant) % 8
  const rotate = [-24, 18, 40, -12, 30, -40, 14, -32][v]
  const emblemScale = [1, 1.25, 0.9, 1.5, 1.1, 0.8, 1.35, 1][v]
  const glowPos = [
    'left-[-18%] top-[-22%]',
    'right-[-16%] top-[-20%]',
    'left-[10%] top-[-30%]',
    'right-[12%] bottom-[-24%]',
    'left-[-10%] bottom-[-18%]',
    'right-[-22%] top-[8%]',
    'left-[20%] top-[-18%]',
    'left-[-14%] bottom-[6%]',
  ][v]

  const sparks = [
    { left: ['14%', '72%'][v % 2], top: ['18%', '24%'][Math.floor(v / 2) % 2], delay: 0 },
    { left: ['80%', '26%'][v % 2], top: ['64%', '15%'][Math.floor(v / 2) % 2], delay: 0.9 },
    { left: ['44%', '86%'][v % 2], top: ['78%', '70%'][Math.floor(v / 2) % 2], delay: 1.7 },
  ]

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${g.gradient[0]} 0%, ${g.gradient[1]} 52%, ${g.gradient[2]} 100%)` }}
    >
      {/* Brilho principal */}
      <div
        className={`pointer-events-none absolute h-[130%] w-[130%] rounded-full ${glowPos}`}
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.28), transparent 62%)' }}
      />
      {/* Grid sutil de "pixels" */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black, transparent 78%)',
        }}
      />
      {/* Emblema do jogo (marca d'água) */}
      <Icon
        className="pointer-events-none absolute -bottom-[18%] -right-[10%] text-white/20"
        style={{ width: '74%', height: '74%', transform: `rotate(${rotate}deg) scale(${emblemScale})` }}
        strokeWidth={1.4}
      />
      {/* Partículas */}
      {sparks.map((s, i) => (
        <span
          key={i}
          className="animate-pulse-soft pointer-events-none absolute h-[7px] w-[7px] rounded-full bg-gold/80"
          style={{ left: s.left, top: s.top, animationDelay: `${s.delay}s` }}
        />
      ))}
      {/* Emoji do produto */}
      {emoji && (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]"
          style={{ fontSize: emojiSize }}
          role="img"
          aria-label="Ilustração do produto"
        >
          {emoji}
        </span>
      )}
      {/* Vinheta inferior para legibilidade dos selos */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
    </div>
  )
}

export default memo(GameArt)