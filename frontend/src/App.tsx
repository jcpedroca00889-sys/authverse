import { useCallback, useEffect, useRef, useState } from 'react';
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

  const [pathname, setPathname] = useState(window.location.pathname);

  // Sincroniza com navegações do browser (botão voltar/avançar)
  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Navegação programática (SPA sem router externo)
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

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

  // troca de tela sempre comeca no topo
  useEffect(() => {
    if (loading) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [user, loading, pathname]);

  const isAdmin = user?.isAdmin === true;

  const renderPage = () => {
    if (loading) return <BootScreen />;

    // Rota /admin: exige login + admin
    if (pathname === '/admin') {
      if (!user) {
        return <AuthPage key="auth" onSuccess={() => navigate('/admin')} />;
      }
      if (!isAdmin) {
        // Usuário comum tentou /admin → volta para a loja
        navigate('/');
        return <Store key="store" onAdminClick={() => navigate('/admin')} />;
      }
      return <AdminPage key="admin" />;
    }

    // Rota padrão: loja (ou login se deslogado)
    if (!user) return <AuthPage key="auth" onSuccess={() => navigate('/')} />;
    return <Store key="store" onAdminClick={() => navigate('/admin')} />;
  };

  return (
    <>
      <Background />
      <CursorGlow />
      <RuntimeControls />
      <SuccessBurst show={celebrate} />
      {renderPage()}
    </>
  );
}