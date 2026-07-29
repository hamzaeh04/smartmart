import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  Truck,
  ClipboardList,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import type { Permission } from "@/utils/permissions";

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
  permissions?: Permission[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Products", path: "/products", icon: Package, permission: "products.manage" },
  { label: "Categories", path: "/categories", icon: Tags, permission: "categories.manage" },
  { label: "Inventory", path: "/inventory", icon: Boxes, permission: "inventory.manage" },
  { label: "Suppliers", path: "/suppliers", icon: Truck, permission: "suppliers.manage" },
  { label: "Purchases", path: "/purchases", icon: ClipboardList, permission: "purchases.manage" },
  { label: "POS", path: "/pos", icon: ShoppingCart, permission: "pos.access" },
  { label: "Sales", path: "/sales", icon: Receipt, permissions: ["sales.viewAll", "sales.viewOwn"] },
  { label: "Reports", path: "/reports", icon: BarChart3, permission: "reports.view" },
  { label: "Users", path: "/users", icon: Users, permission: "users.manage" },
  { label: "Settings", path: "/settings", icon: Settings, permission: "settings.manage" },
];
