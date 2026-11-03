export interface User { 
  id: string; 
  username: string; 
  createdAt: string;
  isAdmin?: boolean;
}

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

async function productRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/products${path}`, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...init });
  } catch {
    throw new ApiError('Servidor indisponível. Verifique sua conexão e tente de novo.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error?.message ?? 'Erro inesperado.', data?.error?.field, res.status);
  return data as T;
}

const post = <T,>(path: string, body?: object) => request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
const productPost = <T,>(path: string, body?: object) => productRequest<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
const productPut = <T,>(path: string, body?: object) => productRequest<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) });
const productDelete = <T,>(path: string) => productRequest<T>(path, { method: 'DELETE' });

export const api = {
  me: () => request<{ user: User }>('/me'),
  login: (username: string, password: string) => post<{ user: User }>('/login', { username, password }),
  register: (username: string, password: string, confirmPassword: string) =>
    post<{ user: User }>('/register', { username, password, confirmPassword }),
  logout: () => post<{ ok: true }>('/logout'),

  // Admin product CRUD
  products: {
    create: (data: object) => productPost<{ product: any }>('/', data),
    update: (id: string, data: object) => productPut<{ product: any }>(`/${id}`, data),
    delete: (id: string) => productDelete<{ ok: true }>(`/${id}`),
  },
};