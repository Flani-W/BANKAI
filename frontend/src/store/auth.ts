import { create } from 'zustand';
import { api, type AuthUser } from '../lib/api';

const TOKEN_KEY = 'bankai.token';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  /** true until we've checked any stored token on first load */
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Validate any persisted token against the backend. */
  restore: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  initializing: true,

  async login(email, password) {
    const res = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    set({ token: res.access_token, user: res.user });
  },

  async register(email, password) {
    await api.register(email, password);
    // Auto-login after successful registration for a smooth flow.
    await get().login(email, password);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  async restore() {
    // Dev preview: explore the full 3D experience without a backend/database.
    // Gated behind an env flag so it can NEVER leak into a real build.
    if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
      set({ user: { id: 'dev-guest', email: 'guest@bankai.dev' }, initializing: false });
      return;
    }

    const token = get().token;
    if (!token) {
      set({ initializing: false });
      return;
    }
    try {
      const user = await api.me(token);
      set({ user, initializing: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, initializing: false });
    }
  },
}));
