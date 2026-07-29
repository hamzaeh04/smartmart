import type { Role } from "@/types";

export type Permission =
  | "dashboard.view"
  | "products.manage"
  | "categories.manage"
  | "inventory.manage"
  | "suppliers.manage"
  | "purchases.manage"
  | "pos.access"
  | "sales.viewAll"
  | "sales.viewOwn"
  | "reports.view"
  | "users.manage"
  | "settings.manage";

const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
  admin: [
    "dashboard.view",
    "products.manage",
    "categories.manage",
    "inventory.manage",
    "suppliers.manage",
    "purchases.manage",
    "pos.access",
    "sales.viewAll",
    "reports.view",
    "users.manage",
    "settings.manage",
  ],
  manager: [
    "dashboard.view",
    "products.manage",
    "categories.manage",
    "inventory.manage",
    "suppliers.manage",
    "purchases.manage",
    "pos.access",
    "sales.viewAll",
    "reports.view",
  ],
  cashier: ["pos.access", "sales.viewOwn"],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS_BY_ROLE[role].includes(permission);
}

export function hasAnyPermission(role: Role | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
