import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import type { ToastVariant } from "@/store/toastStore";
import { cn } from "@/utils/cn";

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastVariant, string> = {
  success: "border-brand-200 bg-brand-50 text-brand-800 [&_svg]:text-brand-600",
  error: "border-danger-200 bg-danger-50 text-danger-800 [&_svg]:text-danger-600",
  warning: "border-warning-200 bg-warning-50 text-warning-800 [&_svg]:text-warning-600",
  info: "border-info-200 bg-info-50 text-info-800 [&_svg]:text-info-600",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
              COLORS[t.variant],
            )}
          >
            <Icon className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm opacity-90">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
