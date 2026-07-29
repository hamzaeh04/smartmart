import { Store } from "lucide-react";
import { cn } from "@/utils/cn";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
        <Store className="size-[18px]" strokeWidth={2.25} />
      </div>
      {!compact && (
        <span className="text-[15px] font-bold tracking-tight text-white">
          Smart<span className="text-brand-400">Mart</span>
        </span>
      )}
    </div>
  );
}
