import { useNavigate } from "react-router-dom";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useRecentSales } from "../hooks";
import type { PaymentMethod } from "@/types";

const PAYMENT_ICON: Record<PaymentMethod, typeof Wallet> = {
  cash: Wallet,
  card: CreditCard,
  online: Landmark,
};

export function RecentSales() {
  const { data, isLoading } = useRecentSales(6);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Recent Sales"
        subtitle="Latest transactions across all registers"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate("/sales")}>
            View All
          </Button>
        }
      />
      {isLoading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : !data?.length ? (
        <EmptyState title="No sales yet" description="Completed sales will show up here." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((sale) => {
            const Icon = PAYMENT_ICON[sale.payment.method];
            return (
              <li
                key={sale.id}
                onClick={() => navigate(`/sales/${sale.id}`)}
                className="flex cursor-pointer items-center gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{sale.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">
                    {sale.customerName} · {formatDateTime(sale.createdAt)}
                  </p>
                </div>
                <Badge variant={sale.status === "completed" ? "success" : "neutral"}>{sale.status}</Badge>
                <p className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
                  {formatCurrency(sale.total)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
