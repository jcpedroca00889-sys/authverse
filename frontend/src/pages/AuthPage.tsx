import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../components/Logo';
import AuthForm from '../components/AuthForm';
import HoloCard from '../components/HoloCard';
import ModeSwitch from '../components/ModeSwitch';
import { usePrefs } from '../hooks/usePrefs';

interface Props {
  onSuccess?: () => void;
}

export default function AuthPage({ onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { reduce } = usePrefs();
  const dir = mode === 'login' ? -1 : 1;

  return (
    <motion.main
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="relative z-10 grid w-full place-items-start sm:place-items-center px-4 py-6 sm:py-12 min-h-[100dvh] sm:min-h-screen overflow-y-auto [padding-bottom:max(1rem,env(safe-area-inset-bottom))]"
      style={{ perspective: 1400 }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 70, rotateX: -25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        className="w-full max-w-md"
      >
        <HoloCard className="p-8 sm:p-10">
          <Logo />
          <ModeSwitch mode={mode} onChange={setMode} />
          <AnimatePresence mode="wait" initial={!reduce}>
            <motion.div
              key={mode}
              initial={reduce ? false : { opacity: 0, rotateY: 55 * dir, x: 40 * dir, scale: 0.96, filter: 'blur(10px)' }}
              animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -55 * dir, x: -40 * dir, scale: 0.96, filter: 'blur(10px)' }}
              transition={{ duration: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <AuthForm mode={mode} onSwitch={() => setMode(mode === 'login' ? 'register' : 'login')} onSuccess={onSuccess} />
            </motion.div>
          </AnimatePresence>
        </HoloCard>
      </motion.div>
    </motion.main>
  );
}