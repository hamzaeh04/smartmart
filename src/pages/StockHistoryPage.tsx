import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, PackageMinus, PackagePlus, ShoppingBag, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { useStockHistory } from "@/features/inventory/hooks";
import { formatDateTime } from "@/utils/format";
import type { AdjustmentType, StockHistory, StockHistorySource } from "@/types";

const SOURCE_META: Record<StockHistorySource, { label: string; icon: typeof ShoppingBag }> = {
  purchase: { label: "Purchase", icon: ShoppingBag },
  sale: { label: "Sale", icon: ShoppingCart },
  adjustment: { label: "Manual Adjustment", icon: SlidersHorizontal },
};

export default function StockHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productIdFilter = searchParams.get("productId") ?? "";

  const [search, setSearch] = useState("");
  const [type, setType] = useState<AdjustmentType | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStockHistory({
    search,
    productId: productIdFilter || undefined,
    type: type || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo ? `${dateTo}T23:59:59.999Z` : undefined,
    page,
    pageSize: 15,
  });

  const columns: Column<StockHistory>[] = [
    {
      key: "productName",
      header: "Product",
      render: (h) => (
        <div>
          <p className="font-medium text-slate-800">{h.productName}</p>
          <p className="flex items-center gap-1 text-xs text-slate-400">
            {(() => {
              const Icon = SOURCE_META[h.source].icon;
              return <Icon className="size-3" />;
            })()}
            {SOURCE_META[h.source].label}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (h) => (
        <Badge variant={h.type === "add" ? "success" : "danger"}>
          {h.type === "add" ? <PackagePlus className="size-3" /> : <PackageMinus className="size-3" />}
          {h.type === "add" ? "Added" : "Removed"}
        </Badge>
      ),
    },
    { key: "quantityChanged", header: "Qty Changed", render: (h) => <span className="tabular-nums font-medium">{h.type === "add" ? "+" : "-"}{h.quantityChanged}</span> },
    { key: "previousQuantity", header: "Previous", render: (h) => <span className="tabular-nums text-slate-500">{h.previousQuantity}</span> },
    { key: "newQuantity", header: "New Qty", render: (h) => <span className="tabular-nums font-medium text-slate-800">{h.newQuantity}</span> },
    { key: "reason", header: "Reason", render: (h) => <span className="text-slate-600">{h.reason}</span> },
    { key: "userName", header: "User", render: (h) => <span className="text-slate-500">{h.userName}</span> },
    { key: "createdAt", header: "Date & Time", render: (h) => <span className="whitespace-nowrap text-slate-500">{formatDateTime(h.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/inventory")} className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Back to Inventory
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock History</h1>
        <p className="mt-1 text-sm text-slate-500">Every inventory movement, fully traceable.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProductSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by product or reason..." className="w-64" />
        <Select
          placeholder="All Types"
          options={[{ value: "add", label: "Added" }, { value: "remove", label: "Removed" }]}
          value={type}
          onChange={(e) => { setType(e.target.value as AdjustmentType | ""); setPage(1); }}
          containerClassName="w-40"
        />
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} containerClassName="w-40" aria-label="From date" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} containerClassName="w-40" aria-label="To date" />
      </div>

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={10} cols={8} />
        ) : !data?.items.length ? (
          <EmptyState title="No stock movements found" description="Try adjusting your filters." />
        ) : (
          <>
            <Table columns={columns} data={data.items} rowKey={(h) => h.id} />
            <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
