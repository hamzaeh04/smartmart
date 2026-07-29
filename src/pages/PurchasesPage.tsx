import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { usePurchases } from "@/features/purchases/hooks";
import { useSuppliers } from "@/features/suppliers/hooks";
import { formatCurrency, formatDate } from "@/utils/format";
import type { PaymentStatus, Purchase, PurchaseStatus } from "@/types";

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

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState<PurchaseStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const { data: suppliers = [] } = useSuppliers();
  const { data, isLoading } = usePurchases({
    search,
    supplierId: supplierId || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: 10,
  });

  const columns: Column<Purchase>[] = [
    { key: "purchaseNumber", header: "Purchase #", render: (p) => <span className="font-medium text-slate-800">{p.purchaseNumber}</span> },
    { key: "supplierName", header: "Supplier", render: (p) => <span className="text-slate-600">{p.supplierName}</span> },
    { key: "items", header: "Products", render: (p) => <span className="tabular-nums text-slate-500">{p.items.length}</span> },
    { key: "total", header: "Total Amount", render: (p) => <span className="tabular-nums font-medium">{formatCurrency(p.total)}</span> },
    { key: "paymentStatus", header: "Payment", render: (p) => <Badge variant={PAYMENT_VARIANT[p.paymentStatus]}>{p.paymentStatus}</Badge> },
    { key: "status", header: "Status", render: (p) => <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge> },
    { key: "purchaseDate", header: "Date", render: (p) => <span className="text-slate-500">{formatDate(p.purchaseDate)}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <Button variant="ghost" size="icon" aria-label="View purchase" onClick={(e) => { e.stopPropagation(); navigate(`/purchases/${p.id}`); }}>
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchases</h1>
          <p className="mt-1 text-sm text-slate-500">Receive stock from suppliers and track purchase orders.</p>
        </div>
        <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate("/purchases/new")}>
          Create Purchase
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProductSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search purchase # or supplier..." className="w-64" />
        <Select placeholder="All Suppliers" options={suppliers.map((s) => ({ value: s.id, label: s.name }))} value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setPage(1); }} containerClassName="w-48" />
        <Select placeholder="All Status" options={[{ value: "draft", label: "Draft" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]} value={status} onChange={(e) => { setStatus(e.target.value as PurchaseStatus | ""); setPage(1); }} containerClassName="w-40" />
        <Select placeholder="All Payments" options={[{ value: "paid", label: "Paid" }, { value: "unpaid", label: "Unpaid" }, { value: "partial", label: "Partially Paid" }]} value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value as PaymentStatus | ""); setPage(1); }} containerClassName="w-40" />
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} containerClassName="w-40" aria-label="From date" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} containerClassName="w-40" aria-label="To date" />
      </div>

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : !data?.items.length ? (
          <EmptyState title="No purchases found" description="Create a purchase order to receive stock from a supplier." actionLabel="Create Purchase" onAction={() => navigate("/purchases/new")} />
        ) : (
          <>
            <Table columns={columns} data={data.items} rowKey={(p) => p.id} onRowClick={(p) => navigate(`/purchases/${p.id}`)} />
            <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
