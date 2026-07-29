import type { ReactNode } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Package, Warehouse, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SkeletonCards } from "@/components/feedback/SkeletonLoader";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { DashboardSummary } from "@/services/dashboardService";
import { cn } from "@/utils/cn";

interface SummaryCardProps {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  changePct?: number;
  comparisonLabel: string;
}

function SummaryCard({ icon, iconClassName, label, value, changePct, comparisonLabel }: SummaryCardProps) {
  const isPositive = (changePct ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-lg", iconClassName)}>{icon}</div>
        {changePct !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive ? "bg-brand-50 text-brand-700" : "bg-danger-50 text-danger-700",
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(changePct)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {changePct !== undefined && <p className="mt-2 text-xs text-slate-400">{comparisonLabel}</p>}
    </Card>
  );
}

export function SummaryCards({
  summary,
  isLoading,
  comparisonLabel,
}: {
  summary?: DashboardSummary;
  isLoading: boolean;
  comparisonLabel: string;
}) {
  if (isLoading || !summary) return <SkeletonCards count={4} />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        icon={<Wallet className="size-5 text-brand-600" />}
        iconClassName="bg-brand-50"
        label="Total Sales"
        value={formatCurrency(summary.totalSalesToday)}
        changePct={summary.totalSalesChangePct}
        comparisonLabel={comparisonLabel}
      />
      <SummaryCard
        icon={<Package className="size-5 text-info-600" />}
        iconClassName="bg-info-50"
        label="Total Products"
        value={formatNumber(summary.totalProducts)}
        comparisonLabel="Across all categories"
      />
      <SummaryCard
        icon={<Warehouse className="size-5 text-slate-600" />}
        iconClassName="bg-slate-100"
        label="Inventory Value"
        value={formatCurrency(summary.inventoryValue)}
        changePct={summary.inventoryValueChangePct}
        comparisonLabel={comparisonLabel}
      />
      <SummaryCard
        icon={<AlertTriangle className="size-5 text-warning-600" />}
        iconClassName="bg-warning-50"
        label="Low-Stock Products"
        value={formatNumber(summary.lowStockCount)}
        changePct={summary.lowStockChangePct}
        comparisonLabel={comparisonLabel}
      />
    </div>
  );
}
