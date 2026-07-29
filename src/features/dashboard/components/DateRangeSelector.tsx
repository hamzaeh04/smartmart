import type { DateRange } from "@/services/dashboardService";
import { cn } from "@/utils/cn";

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "month", label: "This Month" },
];

export function DateRangeSelector({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt.value ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-800",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
