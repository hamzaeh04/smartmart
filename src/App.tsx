import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequirePermission } from "@/routes/RequirePermission";
import { protectedRoutes } from "@/routes/config";
import { ToastContainer } from "@/components/feedback/ToastContainer";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ProductScanner } from "@/features/scanner/ProductScanner";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "cashier" ? "/pos" : "/dashboard"} replace />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner className="min-h-screen" />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<HomeRedirect />} />
                {protectedRoutes.map(({ path, Component, permission, permissions, props }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <RequirePermission permission={permission} permissions={permissions}>
                        <Component {...props} />
                      </RequirePermission>
                    }
                  />
                ))}
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <ProductScanner />
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
}
