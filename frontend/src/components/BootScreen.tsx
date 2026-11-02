import { motion } from 'framer-motion';

/** Tela de boot: logo com glitch, barra indeterminada e mensagem de conexao. */
export default function BootScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 grid min-h-screen place-items-center px-6"
    >
      <div className="w-full max-w-xs text-center">
        <h1 className="relative text-2xl font-bold tracking-[.3em]">
          <span aria-hidden className="glitch-a">AUTHVERSE</span>
          <span aria-hidden className="glitch-b">AUTHVERSE</span>
          <span className="relative bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-200 bg-clip-text text-transparent">
            AUTHVERSE
          </span>
        </h1>
        <div className="mt-7 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: '-110%' }}
            animate={{ x: '110%' }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-500 via-blue-400 to-cyan-300 shadow-[0_0_12px_rgba(34,211,238,.8)]"
          />
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[.35em] text-slate-500">
          Estabelecendo conexão segura
        </p>
      </div>
    </motion.div>
  );
}
