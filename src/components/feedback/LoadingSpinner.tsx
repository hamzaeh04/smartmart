import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function LoadingSpinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-10 text-slate-400", className)} role="status">
      <Loader2 className="size-5 animate-spin" />
      <span className="text-sm">{label}...</span>
    </div>
  );
}
