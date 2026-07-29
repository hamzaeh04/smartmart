import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePurchase, useCancelPurchase, useCompletePurchase } from "@/features/purchases/hooks";
import { formatCurrency, formatDate } from "@/utils/format";
import type { PaymentStatus, PurchaseItem, PurchaseStatus } from "@/types";

const STATUS_VARIANT: Record<PurchaseStatus, "success" | "warning" | "neutral"> = {
  completed: "success",
  draft: "warning",
  cancelled: "neutral",
};
const PAYMENT_VARIANT: Record<PaymentStatus, "success" | "warning" | "danger"> = {
  paid: "success",
  partial: "warning",
  unpaid: "danger",
};

export default function PurchaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: purchase, isLoading, isError, refetch } = usePurchase(id);
  const completePurchase = useCompletePurchase();
  const cancelPurchase = useCancelPurchase();

  if (isLoading) return <LoadingSpinner />;
  if (isError || !purchase) return <ErrorState title="Purchase not found" onRetry={refetch} />;

  const columns: Column<PurchaseItem>[] = [
    {
      key: "productName",
      header: "Product",
      render: (i) => (
        <div className="flex items-center gap-3">
          <img src={i.productImage} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
          <span className="font-medium text-slate-800">{i.productName}</span>
        </div>
      ),
    },
    { key: "quantity", header: "Quantity", render: (i) => <span className="tabular-nums">{i.quantity}</span> },
    { key: "purchasePrice", header: "Unit Price", render: (i) => <span className="tabular-nums">{formatCurrency(i.purchasePrice)}</span> },
    { key: "lineTotal", header: "Line Total", render: (i) => <span className="tabular-nums font-medium">{formatCurrency(i.lineTotal)}</span> },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate("/purchases")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to Purchases
      </button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{purchase.purchaseNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">{purchase.supplierName} · {formatDate(purchase.purchaseDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[purchase.status]}>{purchase.status}</Badge>
          <Badge variant={PAYMENT_VARIANT[purchase.paymentStatus]}>{purchase.paymentStatus}</Badge>
        </div>
      </div>

      {purchase.status === "draft" && (
        <div className="flex items-center justify-between rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
          <p className="text-sm text-warning-800">This purchase is a draft. Inventory has not been updated yet.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<XCircle className="size-4" />} onClick={() => cancelPurchase.mutate(purchase.id)} isLoading={cancelPurchase.isPending}>
              Cancel Purchase
            </Button>
            <Button size="sm" leftIcon={<CheckCircle2 className="size-4" />} onClick={() => completePurchase.mutate(purchase.id)} isLoading={completePurchase.isPending}>
              Complete Purchase
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Products" />
        <Table columns={columns} data={purchase.items} rowKey={(i) => i.id} />
        <CardContent className="ml-auto max-w-xs space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums font-medium">{formatCurrency(purchase.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="tabular-nums font-medium">{formatCurrency(purchase.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-bold tabular-nums text-brand-700">{formatCurrency(purchase.total)}</span>
          </div>
        </CardContent>
      </Card>

      {purchase.notes && (
        <Card>
          <CardHeader title="Notes" />
          <CardContent>
            <p className="text-sm text-slate-600">{purchase.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
