import { memo } from 'react'
import { initials } from '../../lib/format'

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

/** Avatar circular com iniciais e cor determinística (sem imagens externas). */
function Avatar({ name, size = 36, className = '' }: AvatarProps) {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = hash % 360
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ring-2 ring-edge/60 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.36),
        background: `linear-gradient(135deg, hsl(${hue} 68% 52%), hsl(${(hue + 38) % 360} 72% 38%))`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

export default memo(Avatar)