import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Permission } from "@/utils/permissions";

interface RequirePermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  children: ReactNode;
}

export function RequirePermission({ permission, permissions, children }: RequirePermissionProps) {
  const { can, canAny } = useAuth();

  if (!permission && !permissions) return <>{children}</>;
  const allowed = permissions ? canAny(permissions) : can(permission!);
  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <ShieldAlert className="size-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Access restricted</p>
          <p className="mt-1 text-sm text-slate-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Alternative that redirects instead of showing an inline message — used for pages with no partial view. */
export function RequirePermissionRedirect({ permission, children }: RequirePermissionProps) {
  const { can } = useAuth();
  if (permission && !can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
