// Thin client for the login-only backend. The frontend never talks to the database directly.

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginResult {
  access_token: string;
  expires_at: number;
  user: AuthUser;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export const api = {
  register(email: string, password: string) {
    return post<{ user: AuthUser }>('/api/v1/auth/register', { email, password });
  },
  login(email: string, password: string) {
    return post<LoginResult>('/api/v1/auth/login', { email, password });
  },
  async me(token: string): Promise<AuthUser> {
    let res: Response;
    try {
      res = await fetch(`${BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new Error('Cannot reach the server.');
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string; user?: AuthUser };
    if (!res.ok || !data.user) throw new Error(data.error ?? 'Unauthorized');
    return data.user;
  },
};
