import { motion } from 'framer-motion';

type Mode = 'login' | 'register';

/** Seletor Entrar / Criar conta com indicador luminoso deslizante. */
export default function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const items: { id: Mode; label: string }[] = [
    { id: 'login', label: 'Entrar' },
    { id: 'register', label: 'Criar conta' },
  ];
  return (
    <div className="relative mb-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
      {items.map((it) => {
        const on = mode === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            aria-pressed={on}
            className="relative rounded-full px-4 py-2 text-sm font-medium outline-none"
          >
            {on && (
              <motion.span
                layoutId="mode-pill"
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 shadow-[0_0_26px_-6px_rgba(99,102,241,.95)]"
              />
            )}
            <span className={`relative z-10 transition-colors ${on ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
