import { PiggyBank, ShoppingBag, Truck, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/feedback/SkeletonLoader";
import { formatCurrency } from "@/utils/format";
import { useProfitSummary } from "../hooks";
import type { DateRange } from "@/services/dashboardService";

export function ProfitOverview({ range }: { range: DateRange }) {
  const { data: profit, isLoading } = useProfitSummary(range);

  return (
    <Card>
      <CardHeader
        title="Profit & Purchases Overview"
        subtitle="What you paid suppliers vs. what you sold products for in this period"
      />
      {isLoading || !profit ? (
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <Tile
            icon={<Truck className="size-4 text-slate-600" />}
            iconClassName="bg-slate-100"
            label="Purchases from Suppliers"
            value={formatCurrency(profit.totalPurchases)}
            hint="Amount paid to restock inventory"
          />
          <Tile
            icon={<ShoppingBag className="size-4 text-info-600" />}
            iconClassName="bg-info-50"
            label="Gross Sales"
            value={formatCurrency(profit.grossSales)}
            hint="Total sold before discounts"
          />
          <Tile
            icon={<Wallet className="size-4 text-slate-600" />}
            iconClassName="bg-slate-100"
            label="Net Sales"
            value={formatCurrency(profit.netSales)}
            hint="Sold amount after discounts"
          />
          <Tile
            icon={<PiggyBank className="size-4 text-brand-600" />}
            iconClassName="bg-brand-50"
            label="Net Profit"
            value={formatCurrency(profit.netProfit)}
            valueClassName="text-brand-700"
            hint={
              <Badge variant={profit.profitMarginPct >= 0 ? "success" : "danger"}>
                {profit.profitMarginPct.toFixed(1)}% margin
              </Badge>
            }
          />
        </div>
      )}
    </Card>
  );
}

interface TileProps {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  valueClassName?: string;
  hint: React.ReactNode;
}

function Tile({ icon, iconClassName, label, value, valueClassName, hint }: TileProps) {
  return (
    <div className="p-5">
      <div className={`flex size-9 items-center justify-center rounded-lg ${iconClassName}`}>{icon}</div>
      <p className={`mt-3 text-xl font-bold tabular-nums tracking-tight text-slate-900 ${valueClassName ?? ""}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </div>
  );
}
