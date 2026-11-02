export interface User { id: string; username: string; createdAt: string }

export class ApiError extends Error {
  constructor(message: string, public field?: string, public status = 0) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/auth${path}`, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...init });
  } catch {
    throw new ApiError('Servidor indisponível. Verifique sua conexão e tente de novo.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error?.message ?? 'Erro inesperado.', data?.error?.field, res.status);
  return data as T;
}

const post = <T,>(path: string, body?: object) => request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const api = {
  me: () => request<{ user: User }>('/me'),
  login: (username: string, password: string) => post<{ user: User }>('/login', { username, password }),
  register: (username: string, password: string, confirmPassword: string) =>
    post<{ user: User }>('/register', { username, password, confirmPassword }),
  logout: () => post<{ ok: true }>('/logout'),
};
