import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

export const AUTH_STORAGE_KEY = "gropumeeting_auth";

export type AuthUser = Record<string, unknown> & {
  id?: string;
  email?: string;
  name?: string;
};

function readPersisted(): {
  token: string | null;
  user: AuthUser | null;
} {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser };
    if (parsed.token && parsed.user) {
      return { token: parsed.token, user: parsed.user };
    }
  } catch {
    /* ignore */
  }
  return { token: null, user: null };
}

const persisted = readPersisted();

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: persisted.token,
  user: persisted.user,
  isAuthenticated: !!persisted.token,

  login: (token, user) => {
    let merged: AuthUser = { ...user };
    try {
      const decoded = jwtDecode<Record<string, unknown>>(token);
      merged = { ...decoded, ...user };
    } catch {
      /* keep API user only */
    }
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, user: merged })
    );
    set({ token, user: merged, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

/** Token for non-React fetch helpers (e.g. `api.ts`); falls back to localStorage */
export function getStoredAuthToken(): string | null {
  const fromStore = useAuthStore.getState().token;
  if (fromStore) return fromStore;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { token?: string };
      return parsed.token ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}
