import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Banana } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-edge/60 bg-[#1b120d]"
      >
        <Banana size={48} className="text-gold" />
      </motion.div>
      <h1 className="font-display text-6xl font-extrabold text-gold">404</h1>
      <p className="font-display mt-2 text-2xl font-extrabold text-white">Esta página fugiu da selva! 🐒</p>
      <p className="mt-2 text-sm leading-relaxed text-sand">
        O endereço que você procura não existe ou foi movido. Que tal voltar para a loja?
      </p>
      <Link
        to="/loja"
        className="grad-btn mt-6 rounded-2xl px-8 py-3.5 font-display text-sm font-extrabold tracking-wide text-white shadow-[0_16px_36px_-12px_rgba(255,121,0,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-110"
      >
        VOLTAR PARA A LOJA
      </Link>
    </div>
  )
}