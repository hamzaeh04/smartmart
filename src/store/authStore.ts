import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginRequest, fetchCurrentUser } from "@/services/authService";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password, _remember) => {
        set({ isLoading: true, error: null });
        try {
          const session = await loginRequest({ email, password });
          set({ user: session.user, token: session.token, isLoading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Unable to sign in", isLoading: false });
          throw err;
        }
      },

      logout: () => set({ user: null, token: null, error: null }),

      clearError: () => set({ error: null }),

      restoreSession: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const fresh = await fetchCurrentUser(user.id);
          set({ user: fresh });
        } catch {
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "smartmart-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
