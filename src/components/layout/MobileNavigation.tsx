import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "@/routes/navConfig";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

export function MobileNavigation() {
  const { user, logout, can, canAny } = useAuth();
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.permissions) return canAny(item.permissions);
    if (item.permission) return can(item.permission);
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="relative flex h-full w-72 flex-col bg-navy-900">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-navy-300 hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-brand-500/15 text-brand-400" : "text-navy-300 hover:bg-white/5 hover:text-white",
                )
              }
            >
              <item.icon className="size-[18px]" strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <img src={user?.avatar} alt="" className="size-9 rounded-full border border-white/10 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-xs capitalize text-navy-300">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
