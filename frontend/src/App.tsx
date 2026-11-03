import { useEffect, useRef, useState } from 'react';
import Background from './components/Background';
import BootScreen from './components/BootScreen';
import CursorGlow from './components/CursorGlow';
import RuntimeControls from './components/RuntimeControls';
import SuccessBurst from './components/SuccessBurst';
import AuthPage from './pages/AuthPage';
import Store from './pages/Store';
import AdminPage from './pages/AdminPage';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();
  const [celebrate, setCelebrate] = useState(false);
  const booted = useRef(false);
  const prev = useRef(user);

  // celebra apenas login/registro (nao a restauracao de sessao ao abrir a pagina)
  useEffect(() => {
    if (loading) return;
    if (!booted.current) { booted.current = true; prev.current = user; return; }
    if (!prev.current && user) setCelebrate(true);
    prev.current = user;
  }, [user, loading]);

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(false), 1700);
    return () => clearTimeout(t);
  }, [celebrate]);

  // troca de tela sempre comeca no topo (evita herdar o scroll da tela anterior)
  useEffect(() => {
    if (loading) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [user, loading]);

  const isAdmin = user?.username === 'admin';

  return (
    <>
      <Background />
      <CursorGlow />
      <RuntimeControls />
      <SuccessBurst show={celebrate} />
      {loading ? <BootScreen /> : user ? (isAdmin ? <AdminPage key="admin" /> : <Store key="store" />) : <AuthPage key="auth" />}
    </>
  );
}