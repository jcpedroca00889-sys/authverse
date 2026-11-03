import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'
import Background from '../Background'
import { getCurrentUser } from '../../lib/mockAuth'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, search])
  return null
}

export default function StoreLayout() {
  const user = getCurrentUser()
  const location = useLocation()

  if (!user) return <Navigate to="/" replace />

  return (
    <div className="relative min-h-screen bg-coal font-body text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Background />
      </div>

      <ScrollToTop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="min-h-[60vh] flex-1"
        >
          <Outlet />
        </motion.main>
        <Footer />
      </div>
    </div>
  )
}