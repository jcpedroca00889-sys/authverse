import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api, User } from '../services/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string, c: string) => Promise<void>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user, loading,
    login: async (u, p) => setUser((await api.login(u, p)).user),
    register: async (u, p, c) => setUser((await api.register(u, p, c)).user),
    logout: async () => { await api.logout().catch(() => {}); setUser(null); },
  }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
