import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import BrandMark from './BrandMark';
import type { User } from '../../services/api';
import { TYPES, typeLabel } from '../../services/store';

interface Props {
  user: User;
  onLogout: () => void;
  onFilter: (filter: string) => void;
  activeFilter: string;
}

export default function StoreNav({ user, onLogout, onFilter, activeFilter }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = user.username.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05030f]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <a href="#topo" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="text-sm font-bold tracking-[.28em] text-slate-100">AUTHVERSE</span>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.18em] text-cyan-200">
            Store
          </span>
        </a>

        <nav className="ml-6 hidden items-center gap-1 text-xs text-slate-400 lg:flex">
          {['all', ...TYPES.map((t) => t.id)].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onFilter(id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                activeFilter === id
                  ? 'border-transparent bg-violet-600 text-white shadow-[0_0_20px_-8px_rgba(139,92,246,.7)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {id === 'all' ? 'Catálogo' : typeLabel(id as (typeof TYPES)[number]['id'])}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-3 transition hover:border-cyan-300/40"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden max-w-[9rem] truncate text-xs font-medium text-slate-200 sm:block">{user.username}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0720]/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-bold">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">{user.username}</p>
                      <p className="text-[10px] text-slate-500">
                        Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-2 space-y-1.5 px-2 py-1 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">ID</dt>
                      <dd className="truncate font-mono text-[10px] text-slate-400">{user.id.slice(0, 8)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Segurança</dt>
                      <dd className="flex items-center gap-1 text-emerald-300">
                        <ShieldCheck size={12} /> Cookie HttpOnly
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/10"
                  >
                    <LogOut size={14} /> Sair da conta
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
