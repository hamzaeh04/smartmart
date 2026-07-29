import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, Store, TrendingUp, Boxes, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toastStore";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@smartmart.com" },
  { role: "Manager", email: "manager@smartmart.com" },
  { role: "Cashier", email: "cashier@smartmart.com" },
];

export default function LoginPage() {
  const { isAuthenticated, user, login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  if (isAuthenticated) {
    const defaultPath = user?.role === "cashier" ? "/pos" : "/dashboard";
    const from = (location.state as { from?: Location })?.from?.pathname ?? defaultPath;
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values: FormValues) {
    clearError();
    try {
      await login(values.email, values.password, !!values.remember);
    } catch {
      // error surfaced via auth store
    }
  }

  function fillDemo(email: string) {
    setValue("email", email);
    setValue("password", "password");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-500">
            <Store className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Smart<span className="text-brand-400">Mart</span>
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Manage Products, Inventory, Purchases, and Sales in One Place.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-navy-300">
            A single, focused workspace for your store — from receiving stock to closing the register at
            the end of the day.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
                <TrendingUp className="size-4 text-brand-400" />
              </div>
              <span className="text-sm text-navy-300">Real-time sales &amp; inventory dashboards</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
                <ScanLine className="size-4 text-brand-400" />
              </div>
              <span className="text-sm text-navy-300">QR &amp; barcode scanning at every counter</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
                <Boxes className="size-4 text-brand-400" />
              </div>
              <span className="text-sm text-navy-300">Accurate, traceable stock movements</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-navy-400">© 2026 SmartMart. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Store className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Smart<span className="text-brand-600">Mart</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to access your store dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
            {error && (
              <div role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@smartmart.com"
              leftIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="size-4" />}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  {...register("remember")}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  toast({
                    variant: "info",
                    title: "Check with your administrator",
                    description: "Password resets are handled by your store admin.",
                  })
                }
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="mb-2 text-xs font-medium text-slate-500">Demo accounts (password: "password")</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
