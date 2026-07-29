import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "@/routes/navConfig";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  manager: "Store Manager",
  cashier: "Cashier",
};

export function Sidebar() {
  const { user, logout, can, canAny } = useAuth();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.permissions) return canAny(item.permissions);
    if (item.permission) return can(item.permission);
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col bg-navy-900 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-white/10 px-4", collapsed && "justify-center px-0")}>
        <Logo compact={collapsed} />
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-navy-300 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <item.icon className="size-[18px] shrink-0" strokeWidth={2} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-lg py-2 text-navy-300 hover:bg-white/5 hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        {!collapsed && <span className="text-xs">Collapse</span>}
      </button>

      <div className="border-t border-white/10 p-3">
        <div className={cn("flex items-center gap-2.5 rounded-lg px-1 py-1.5", collapsed && "justify-center")}>
          <img
            src={user?.avatar}
            alt=""
            className="size-9 shrink-0 rounded-full border border-white/10 object-cover"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-navy-300">{user && ROLE_LABEL[user.role]}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
