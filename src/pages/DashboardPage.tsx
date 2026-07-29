import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardSummary } from "@/features/dashboard/hooks";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { ProfitOverview } from "@/features/dashboard/components/ProfitOverview";
import { DateRangeSelector } from "@/features/dashboard/components/DateRangeSelector";
import { SalesOverviewChart } from "@/features/dashboard/components/SalesOverviewChart";
import { TopSellingProducts } from "@/features/dashboard/components/TopSellingProducts";
import { LowStockProducts } from "@/features/dashboard/components/LowStockProducts";
import { RecentSales } from "@/features/dashboard/components/RecentSales";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import type { DateRange } from "@/services/dashboardService";

const RANGE_LABEL: Record<DateRange, string> = {
  today: "vs. yesterday",
  "7d": "vs. previous 7 days",
  "30d": "vs. previous 30 days",
  month: "vs. previous month",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<DateRange>("today");
  const { data: summary, isLoading } = useDashboardSummary(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is an overview of your store today{user ? `, ${user.fullName.split(" ")[0]}` : ""}.
          </p>
        </div>
        <DateRangeSelector value={range} onChange={setRange} />
      </div>

      <SummaryCards summary={summary} isLoading={isLoading} comparisonLabel={RANGE_LABEL[range]} />

      <ProfitOverview range={range} />

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesOverviewChart />
        </div>
        <TopSellingProducts />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LowStockProducts />
        <RecentSales />
      </div>
    </div>
  );
}
