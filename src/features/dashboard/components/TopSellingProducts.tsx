import { Card, CardHeader } from "@/components/ui/Card";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatCurrency, formatNumber } from "@/utils/format";
import { useTopSellingProducts } from "../hooks";

export function TopSellingProducts() {
  const { data, isLoading } = useTopSellingProducts(5);

  return (
    <Card>
      <CardHeader title="Top-Selling Products" subtitle="Best performers in the selected period" />
      {isLoading ? (
        <SkeletonTable rows={5} cols={3} />
      ) : !data?.length ? (
        <EmptyState title="No sales yet" description="Top sellers will appear once orders come in." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((item, index) => (
            <li key={item.product.id} className="flex items-center gap-3 px-5 py-3">
              <span className="w-4 shrink-0 text-xs font-semibold text-slate-300">{index + 1}</span>
              <img src={item.product.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{item.product.name}</p>
                <p className="text-xs text-slate-400">{formatNumber(item.quantitySold)} units sold</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                {formatCurrency(item.totalSales)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
