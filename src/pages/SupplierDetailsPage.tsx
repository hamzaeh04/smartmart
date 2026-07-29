import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useSupplier, useSupplierPurchases } from "@/features/suppliers/hooks";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Purchase } from "@/types";

export default function SupplierDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading, isError, refetch } = useSupplier(id);
  const { data: purchases = [] } = useSupplierPurchases(id);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !supplier) {
    return <ErrorState title="Supplier not found" onRetry={refetch} />;
  }

  const columns: Column<Purchase>[] = [
    { key: "purchaseNumber", header: "Purchase #", render: (p) => <span className="font-medium text-slate-800">{p.purchaseNumber}</span> },
    { key: "purchaseDate", header: "Date", render: (p) => <span className="text-slate-500">{formatDate(p.purchaseDate)}</span> },
    { key: "items", header: "Products", render: (p) => <span className="tabular-nums text-slate-500">{p.items.length}</span> },
    { key: "total", header: "Total", render: (p) => <span className="tabular-nums font-medium">{formatCurrency(p.total)}</span> },
    { key: "status", header: "Status", render: (p) => <Badge variant={p.status === "completed" ? "success" : p.status === "draft" ? "warning" : "neutral"}>{p.status}</Badge> },
    { key: "paymentStatus", header: "Payment", render: (p) => <Badge variant={p.paymentStatus === "paid" ? "success" : p.paymentStatus === "partial" ? "warning" : "danger"}>{p.paymentStatus}</Badge> },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => navigate("/suppliers")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to Suppliers
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title={supplier.name} subtitle={supplier.contactPerson} action={<Badge variant={supplier.status === "active" ? "success" : "neutral"}>{supplier.status}</Badge>} />
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-slate-600"><Phone className="size-4 text-slate-400" /> {supplier.phone}</p>
            <p className="flex items-center gap-2 text-slate-600"><Mail className="size-4 text-slate-400" /> {supplier.email}</p>
            <p className="flex items-center gap-2 text-slate-600"><MapPin className="size-4 text-slate-400" /> {supplier.address}</p>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="text-xs text-slate-400">Total Purchase Amount</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{formatCurrency(supplier.totalPurchases)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-slate-400">Number of Purchases</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{supplier.purchaseCount}</p>
            </Card>
          </div>

          <Card>
            <CardHeader title="Purchase History" />
            {purchases.length === 0 ? (
              <EmptyState title="No purchases yet" description="Purchases from this supplier will appear here." />
            ) : (
              <Table columns={columns} data={purchases} rowKey={(p) => p.id} onRowClick={(p) => navigate(`/purchases/${p.id}`)} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
