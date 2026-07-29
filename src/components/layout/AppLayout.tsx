import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { TopNavbar } from "./TopNavbar";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

export function AppLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-surface-subtle">
      <Sidebar />
      <MobileNavigation />
      <div className={cn("flex min-h-screen flex-col transition-[margin] duration-200", collapsed ? "lg:ml-[76px]" : "lg:ml-64")}>
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
