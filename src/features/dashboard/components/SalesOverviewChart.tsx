import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/feedback/SkeletonLoader";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency } from "@/utils/format";
import { useSalesOverview } from "../hooks";
import type { SalesOverviewPoint, SalesOverviewPeriod } from "@/services/dashboardService";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point: SalesOverviewPoint = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{formatCurrency(point.sales)}</p>
      <p className="text-xs text-slate-400">{point.orders} orders</p>
    </div>
  );
}

export function SalesOverviewChart() {
  const [period, setPeriod] = useState<SalesOverviewPeriod>("daily");
  const { data, isLoading } = useSalesOverview(period);

  const stats = useMemo(() => {
    if (!data) return { total: 0, orders: 0, avg: 0 };
    const total = data.reduce((sum, d) => sum + d.sales, 0);
    const orders = data.reduce((sum, d) => sum + d.orders, 0);
    return { total, orders, avg: orders > 0 ? total / orders : 0 };
  }, [data]);

  return (
    <Card>
      <CardHeader
        title="Sales Overview"
        subtitle="Track revenue trends across time periods"
        action={
          <Tabs
            tabs={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
            value={period}
            onChange={(v) => setPeriod(v as SalesOverviewPeriod)}
            className="border-0"
          />
        }
      />
      <div className="grid grid-cols-3 gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs text-slate-400">Total Sales</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{formatCurrency(stats.total)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Orders</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{stats.orders}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Avg. Order Value</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{formatCurrency(stats.avg)}</p>
        </div>
      </div>
      <div className="p-5">
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#salesFill)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
