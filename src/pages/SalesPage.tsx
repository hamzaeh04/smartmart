import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, Printer } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { ReceiptModal } from "@/features/pos/components/ReceiptModal";
import { useSales } from "@/features/sales/hooks";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { PaymentMethod, Sale } from "@/types";

const CASHIERS = [
  { id: "user_admin", name: "Ayesha Raza" },
  { id: "user_manager", name: "Bilal Ahmed" },
  { id: "user_cashier", name: "Sana Tariq" },
  { id: "user_cashier2", name: "Hamza Sheikh" },
];

export default function SalesPage() {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const viewAll = can("sales.viewAll");

  const [search, setSearch] = useState("");
  const [cashierId, setCashierId] = useState(viewAll ? "" : (user?.id ?? ""));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const { data, isLoading } = useSales({
    search,
    cashierId: cashierId || undefined,
    paymentMethod: paymentMethod || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo ? `${dateTo}T23:59:59.999Z` : undefined,
    page,
    pageSize: 10,
  });

  const columns: Column<Sale>[] = [
    { key: "invoiceNumber", header: "Invoice #", render: (s) => <span className="font-medium text-slate-800">{s.invoiceNumber}</span> },
    { key: "customerName", header: "Customer", render: (s) => <span className="text-slate-600">{s.customerName}</span> },
    { key: "items", header: "Items", render: (s) => <span className="tabular-nums text-slate-500">{s.items.length}</span> },
    { key: "total", header: "Total", render: (s) => <span className="tabular-nums font-medium">{formatCurrency(s.total)}</span> },
    { key: "method", header: "Payment", render: (s) => <span className="capitalize text-slate-500">{s.payment.method}</span> },
    { key: "paymentStatus", header: "Status", render: (s) => <Badge variant={s.paymentStatus === "paid" ? "success" : "warning"}>{s.paymentStatus}</Badge> },
    ...(viewAll ? [{ key: "cashierName", header: "Cashier", render: (s: Sale) => <span className="text-slate-500">{s.cashierName}</span> } satisfies Column<Sale>] : []),
    { key: "createdAt", header: "Date & Time", render: (s) => <span className="whitespace-nowrap text-slate-500">{formatDateTime(s.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" aria-label="View invoice" onClick={() => navigate(`/sales/${s.id}`)}>
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Print receipt" onClick={() => setReceiptSale(s)}>
            <Printer className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales History</h1>
        <p className="mt-1 text-sm text-slate-500">
          {viewAll ? "Every completed sale across your store." : "Your completed sales."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProductSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoice or customer..." className="w-64" />
        {viewAll && (
          <Select
            placeholder="All Cashiers"
            options={CASHIERS.map((c) => ({ value: c.id, label: c.name }))}
            value={cashierId}
            onChange={(e) => { setCashierId(e.target.value); setPage(1); }}
            containerClassName="w-44"
          />
        )}
        <Select
          placeholder="All Payment Methods"
          options={[{ value: "cash", label: "Cash" }, { value: "card", label: "Card" }, { value: "online", label: "Online" }]}
          value={paymentMethod}
          onChange={(e) => { setPaymentMethod(e.target.value as PaymentMethod | ""); setPage(1); }}
          containerClassName="w-48"
        />
        {can("pos.access") && (
          <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate("/pos")} className="ml-auto">
            New Sale
          </Button>
        )}
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} containerClassName="w-40" aria-label="From date" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} containerClassName="w-40" aria-label="To date" />
      </div>

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : !data?.items.length ? (
          <EmptyState title="No sales found" description="Try adjusting your filters." />
        ) : (
          <>
            <Table columns={columns} data={data.items} rowKey={(s) => s.id} onRowClick={(s) => navigate(`/sales/${s.id}`)} />
            <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>

      <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
    </div>
  );
}
