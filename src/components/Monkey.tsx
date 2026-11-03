import { motion } from 'framer-motion'

export type MonkeyMood = 'idle' | 'welcome' | 'lookUser' | 'hideEyes' | 'celebrate'

interface MonkeyProps {
  mood?: MonkeyMood
  className?: string
}

/**
 * Mascote MONKEY LARANJA — macaco cartoon em SVG puro, com reações:
 * - welcome    → animação de boas-vindas (pulinho)
 * - lookUser   → olha para o campo de usuário
 * - hideEyes   → cobre os olhos com as mãos (enquanto digita a senha)
 * - celebrate  → comemora (pulos + sorriso aberto)
 */
export default function Monkey({ mood = 'welcome', className = '' }: MonkeyProps) {
  const hiding = mood === 'hideEyes'
  const looking = mood === 'lookUser'
  const celebrating = mood === 'celebrate'
  const welcoming = mood === 'welcome'

  const bodyAnim =
    mood === 'celebrate'
      ? { y: [0, -26, 0, -26, 0], rotate: [0, -4, 4, -4, 0] }
      : mood === 'welcome'
        ? { y: [0, -18, 0], rotate: [-3, 3, 0] }
        : { y: [0, -6, 0], rotate: [-1.6, 1.6, -1.6] }

  const bodyTransition =
    mood === 'idle'
      ? { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: mood === 'celebrate' ? 1.35 : 0.9, ease: 'easeInOut' as const }

  return (
    <motion.div
      className={className}
      initial={{ scale: 0, y: 34, rotate: -12 }}
      animate={{ scale: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 190, damping: 13 }}
    >
      <motion.div className="will-change-transform" animate={bodyAnim} transition={bodyTransition}>
        <svg viewBox="0 0 240 240" width="100%" style={{ height: 'auto' }} role="img" aria-label="Mascote macaco">
          <defs>
            <linearGradient id="fur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFB24D" />
              <stop offset="0.55" stopColor="#FF8A00" />
              <stop offset="1" stopColor="#F26A00" />
            </linearGradient>
            <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FF9500" stopOpacity="0.32" />
              <stop offset="1" stopColor="#FF9500" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Brilho laranja ao redor */}
          <circle cx="120" cy="122" r="104" fill="url(#glow)" />

          {/* Rabo */}
          <path
            d="M 82 214 C 34 224 14 188 28 150"
            fill="none"
            stroke="url(#fur)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M 82 214 C 34 224 14 188 28 150"
            fill="none"
            stroke="#231005"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* Orelhas */}
          <g>
            <circle cx="52" cy="108" r="33" fill="url(#fur)" stroke="#231005" strokeWidth="6" />
            <circle cx="54" cy="106" r="16" fill="#FFDFAF" stroke="#231005" strokeWidth="4" />
            <circle cx="188" cy="108" r="33" fill="url(#fur)" stroke="#231005" strokeWidth="6" />
            <circle cx="186" cy="106" r="16" fill="#FFDFAF" stroke="#231005" strokeWidth="4" />
          </g>

          {/* Tronco */}
          <ellipse cx="120" cy="214" rx="54" ry="29" fill="url(#fur)" stroke="#231005" strokeWidth="6" />

          {/* Cabeça */}
          <ellipse cx="120" cy="120" rx="82" ry="76" fill="url(#fur)" stroke="#231005" strokeWidth="6.5" />

          {/* Mancha facial creme */}
          <ellipse cx="120" cy="132" rx="58" ry="52" fill="#FFF0D9" stroke="#EBCBA3" strokeWidth="2.5" />

          {/* Sobrancelhas */}
          <path d="M 88 102 Q 97 95 107 101" fill="none" stroke="#2A1508" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 133 101 Q 143 95 152 102" fill="none" stroke="#2A1508" strokeWidth="5.5" strokeLinecap="round" />

          {/* Olhos — reagem ao foco no campo de usuário */}
          {hiding ? (
            <g>
              <path d="M 84 120 Q 95 109 106 120" fill="none" stroke="#2A1508" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 134 120 Q 145 109 156 120" fill="none" stroke="#2A1508" strokeWidth="5.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <ellipse cx="95" cy="120" rx="14" ry="17" fill="#FFFFFF" stroke="#2A1508" strokeWidth="3" />
              <ellipse cx="145" cy="120" rx="14" ry="17" fill="#FFFFFF" stroke="#2A1508" strokeWidth="3" />
              <motion.g
                animate={looking ? { x: -2.5, y: 4.5 } : { x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 14 }}
              >
                <circle cx="95" cy="120" r="7" fill="#2A1508" />
                <circle cx="145" cy="120" r="7" fill="#2A1508" />
                <circle cx="93" cy="117" r="2.6" fill="#FFFFFF" />
                <circle cx="143" cy="117" r="2.6" fill="#FFFFFF" />
              </motion.g>
            </g>
          )}

          {/* Bochechas */}
          <circle cx="78" cy="146" r="10" fill="#FF9A4D" opacity="0.5" />
          <circle cx="162" cy="146" r="10" fill="#FF9A4D" opacity="0.5" />

          {/* Focinho */}
          <ellipse cx="120" cy="141" rx="13" ry="10" fill="#F6DCB4" stroke="#2A1508" strokeWidth="3.5" />
          <circle cx="115" cy="142" r="2.2" fill="#2A1508" />
          <circle cx="125" cy="142" r="2.2" fill="#2A1508" />

          {/* Boca */}
          {celebrating ? (
            <g>
              <path d="M 98 150 Q 120 194 142 150 Z" fill="#6B2D12" stroke="#2A1508" strokeWidth="4.5" strokeLinejoin="round" />
              <ellipse cx="120" cy="168" rx="12" ry="7" fill="#FF7A9C" />
            </g>
          ) : (
            <path d="M 102 158 Q 120 177 138 158" fill="none" stroke="#2A1508" strokeWidth="5" strokeLinecap="round" />
          )}

          {/* Mãos — cobrem os olhos ao digitar a senha */}
          <motion.g
            animate={hiding ? { x: 40, y: -100, rotate: -22 } : { x: 0, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 17 }}
          >
            <circle cx="58" cy="206" r="18" fill="#FFC38A" stroke="#231005" strokeWidth="5.5" />
            <circle cx="50" cy="191" r="7" fill="#FFC38A" stroke="#231005" strokeWidth="4" />
            <circle cx="67" cy="192" r="7" fill="#FFC38A" stroke="#231005" strokeWidth="4" />
          </motion.g>
          <motion.g
            animate={hiding ? { x: -40, y: -100, rotate: 22 } : { x: 0, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 17 }}
          >
            <circle cx="182" cy="206" r="18" fill="#FFC38A" stroke="#231005" strokeWidth="5.5" />
            <circle cx="173" cy="192" r="7" fill="#FFC38A" stroke="#231005" strokeWidth="4" />
            <circle cx="190" cy="191" r="7" fill="#FFC38A" stroke="#231005" strokeWidth="4" />
          </motion.g>

          {/* Brilho do pelo (acabamento premium) */}
          <ellipse cx="92" cy="84" rx="27" ry="12" fill="#FFFFFF" opacity="0.22" transform="rotate(-24 92 84)" />
        </svg>
      </motion.div>
    </motion.div>
  )
}