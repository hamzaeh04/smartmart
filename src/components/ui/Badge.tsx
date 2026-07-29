import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type BadgeVariant = "neutral" | "brand" | "info" | "warning" | "danger" | "success";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-600",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-brand-50 text-brand-700",
  info: "bg-info-50 text-info-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-400",
  brand: "bg-brand-500",
  success: "bg-brand-500",
  info: "bg-info-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = "neutral", children, dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotClasses[variant])} />}
      {children}
    </span>
  );
}
