interface Props {
  value: string
  onChange: (v: string) => void
}

const EMOJIS = ['🧑‍🚀', '🔥', '🍉', '🎯', '⛏️', '🐾', '🪙', '💎', '🎨', '📦', '💳', '⚙️', '👾', '🧊', '⭐', '🏆', '🕹️', '🎁']

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {EMOJIS.map((em) => (
        <button
          key={em}
          type="button"
          onClick={() => onChange(em)}
          className={`flex h-10 items-center justify-center rounded-lg text-lg transition-all ${
            value === em ? 'bg-tang/20 ring-2 ring-tang' : 'bg-[#1b120d] hover:bg-[#2c1d13]'
          }`}
          aria-label={`Emoji ${em}`}
        >
          {em}
        </button>
      ))}
    </div>
  )
}