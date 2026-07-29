import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ReceiptModal } from "@/features/pos/components/ReceiptModal";
import { useSale } from "@/features/sales/hooks";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { Sale, SaleItem } from "@/types";

export default function SaleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sale, isLoading, isError, refetch } = useSale(id);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !sale) return <ErrorState title="Sale not found" onRetry={refetch} />;

  const columns: Column<SaleItem>[] = [
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
    { key: "unitPrice", header: "Unit Price", render: (i) => <span className="tabular-nums">{formatCurrency(i.unitPrice)}</span> },
    { key: "lineTotal", header: "Line Total", render: (i) => <span className="tabular-nums font-medium">{formatCurrency(i.lineTotal)}</span> },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => navigate("/sales")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to Sales
      </button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{sale.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDateTime(sale.createdAt)} · Cashier: {sale.cashierName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{sale.status}</Badge>
          <Button variant="outline" size="sm" leftIcon={<Printer className="size-4" />} onClick={() => setReceiptSale(sale)}>
            Print Receipt
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Customer" subtitle={sale.customerName} />
      </Card>

      <Card>
        <CardHeader title="Purchased Products" />
        <Table columns={columns} data={sale.items} rowKey={(i) => i.id} />
        <CardContent className="ml-auto max-w-xs space-y-2 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums font-medium">{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="tabular-nums font-medium">-{formatCurrency(sale.discount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tax</span>
            <span className="tabular-nums font-medium">{formatCurrency(sale.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base">
            <span className="font-semibold text-slate-900">Grand Total</span>
            <span className="font-bold tabular-nums text-brand-700">{formatCurrency(sale.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Payment" />
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Method</p>
            <p className="mt-0.5 font-medium capitalize text-slate-700">{sale.payment.method}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="mt-0.5 font-medium capitalize text-slate-700">{sale.paymentStatus}</p>
          </div>
          {sale.payment.amountReceived !== undefined && (
            <div>
              <p className="text-xs text-slate-400">Amount Received</p>
              <p className="mt-0.5 font-medium text-slate-700">{formatCurrency(sale.payment.amountReceived)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
    </div>
  );
}
