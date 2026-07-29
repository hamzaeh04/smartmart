import { useAuthStore } from "@/store/authStore";
import { hasAnyPermission, hasPermission } from "@/utils/permissions";
import type { Permission } from "@/utils/permissions";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
    can: (permission: Permission) => hasPermission(user?.role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(user?.role, permissions),
  };
}
