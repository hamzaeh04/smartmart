import { lazy } from "react";
import type { Permission } from "@/utils/permissions";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProductFormPage = lazy(() => import("@/pages/ProductFormPage"));
const ProductDetailsPage = lazy(() => import("@/pages/ProductDetailsPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const StockHistoryPage = lazy(() => import("@/pages/StockHistoryPage"));
const SuppliersPage = lazy(() => import("@/pages/SuppliersPage"));
const SupplierDetailsPage = lazy(() => import("@/pages/SupplierDetailsPage"));
const PurchasesPage = lazy(() => import("@/pages/PurchasesPage"));
const PurchaseFormPage = lazy(() => import("@/pages/PurchaseFormPage"));
const PurchaseDetailsPage = lazy(() => import("@/pages/PurchaseDetailsPage"));
const PosPage = lazy(() => import("@/pages/PosPage"));
const SalesPage = lazy(() => import("@/pages/SalesPage"));
const SaleDetailsPage = lazy(() => import("@/pages/SaleDetailsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

export interface RouteEntry {
  path: string;
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
  permission?: Permission;
  permissions?: Permission[];
  props?: Record<string, unknown>;
}

export const protectedRoutes: RouteEntry[] = [
  { path: "/dashboard", Component: DashboardPage, permission: "dashboard.view" },
  { path: "/products", Component: ProductsPage, permission: "products.manage" },
  { path: "/products/new", Component: ProductFormPage, permission: "products.manage" },
  { path: "/products/:id", Component: ProductDetailsPage, permission: "products.manage" },
  { path: "/products/:id/edit", Component: ProductFormPage, permission: "products.manage" },
  { path: "/categories", Component: CategoriesPage, permission: "categories.manage" },
  { path: "/inventory", Component: InventoryPage, permission: "inventory.manage" },
  { path: "/inventory/history", Component: StockHistoryPage, permission: "inventory.manage" },
  { path: "/suppliers", Component: SuppliersPage, permission: "suppliers.manage" },
  { path: "/suppliers/:id", Component: SupplierDetailsPage, permission: "suppliers.manage" },
  { path: "/purchases", Component: PurchasesPage, permission: "purchases.manage" },
  { path: "/purchases/new", Component: PurchaseFormPage, permission: "purchases.manage" },
  { path: "/purchases/:id", Component: PurchaseDetailsPage, permission: "purchases.manage" },
  { path: "/pos", Component: PosPage, permission: "pos.access" },
  { path: "/sales", Component: SalesPage, permissions: ["sales.viewAll", "sales.viewOwn"] },
  { path: "/sales/:id", Component: SaleDetailsPage, permissions: ["sales.viewAll", "sales.viewOwn"] },
  { path: "/reports", Component: ReportsPage, permission: "reports.view" },
  { path: "/users", Component: UsersPage, permission: "users.manage" },
  { path: "/settings", Component: SettingsPage, permission: "settings.manage" },
];
