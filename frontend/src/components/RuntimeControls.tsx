import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Waves } from 'lucide-react';
import { usePrefs } from '../hooks/usePrefs';
import { useToast } from './Toast';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function RuntimeControls() {
  const { reduce, toggleReduce, hyper, toggleHyper } = usePrefs();
  const toast = useToast();

  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = key === KONAMI[i] ? i + 1 : key === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        toggleHyper();
        toast('success', 'Modo hiper-neon ativado. Aproveite o espetáculo.');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleHyper, toast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {hyper && (
        <motion.span
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] text-fuchsia-200"
        >
          Hyper
        </motion.span>
      )}
      <button
        type="button"
        onClick={toggleReduce}
        title={reduce ? 'Ativar animações' : 'Reduzir animações'}
        aria-label={reduce ? 'Ativar animações' : 'Reduzir animações'}
        aria-pressed={reduce}
        className={`glass grid h-10 w-10 place-items-center rounded-full border border-white/10 transition hover:border-cyan-300/50 hover:text-cyan-200 ${reduce ? 'text-cyan-300' : 'text-slate-400'}`}
      >
        <Waves size={17} />
      </button>
      <button
        type="button"
        onClick={() => {
          toggleHyper();
          toast('success', hyper ? 'Modo hiper-neon desligado.' : 'Modo hiper-neon ativado.');
        }}
        title="Modo hiper-neon (ou Konami code)"
        aria-label="Alternar modo hiper-neon"
        aria-pressed={hyper}
        className={`glass grid h-10 w-10 place-items-center rounded-full border border-white/10 transition hover:border-fuchsia-300/60 hover:text-fuchsia-200 ${hyper ? 'text-fuchsia-300' : 'text-slate-400'}`}
      >
        <Sparkles size={17} />
      </button>
    </div>
  );
}
