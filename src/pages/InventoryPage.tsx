import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, QrCode, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { StockStatusBadge } from "@/features/inventory/components/StockStatusBadge";
import { StockAdjustmentModal } from "@/features/inventory/components/StockAdjustmentModal";
import { useInventory } from "@/features/inventory/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useScannerStore } from "@/store/scannerStore";
import { formatDate } from "@/utils/format";
import type { Product, StockStatus } from "@/types";

const STOCK_STATUS_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const openScanner = useScannerStore((s) => s.open);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus | "">("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Product | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data, isLoading, isError, refetch } = useInventory({
    search,
    categoryId: categoryId || undefined,
    stockStatus: stockStatus || undefined,
    page,
    pageSize: 10,
    sortKey,
    sortDirection,
  });

  function handleSort(key: string) {
    if (sortKey === key) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key as keyof Product);
      setSortDirection("asc");
    }
  }

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <img src={p.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{p.name}</p>
            <p className="text-xs text-slate-400">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true, render: (p) => <span className="text-slate-500">{p.category}</span> },
    { key: "currentStock", header: "Current Stock", sortable: true, render: (p) => <span className="tabular-nums font-medium text-slate-800">{p.currentStock} {p.unit}</span> },
    { key: "minimumStock", header: "Minimum Stock", sortable: true, render: (p) => <span className="tabular-nums text-slate-500">{p.minimumStock} {p.unit}</span> },
    { key: "stockStatus", header: "Status", render: (p) => <StockStatusBadge currentStock={p.currentStock} minimumStock={p.minimumStock} /> },
    { key: "updatedAt", header: "Last Updated", sortable: true, render: (p) => <span className="text-slate-500">{formatDate(p.updatedAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setAdjustProduct(p);
            setAdjustModalOpen(true);
          }}
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor stock levels and keep quantities accurate.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<History className="size-4" />} onClick={() => navigate("/inventory/history")}>
            Stock History
          </Button>
          <Button variant="outline" leftIcon={<QrCode className="size-4" />} onClick={() => openScanner("global")}>
            Scan Product
          </Button>
          <Button
            leftIcon={<SlidersHorizontal className="size-4" />}
            onClick={() => {
              setAdjustProduct(null);
              setAdjustModalOpen(true);
            }}
          >
            Adjust Stock
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ProductSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="sm:max-w-xs" />
        <Select
          placeholder="All Categories"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          containerClassName="sm:w-48"
        />
        <Select
          placeholder="All Stock Status"
          options={STOCK_STATUS_OPTIONS}
          value={stockStatus}
          onChange={(e) => { setStockStatus(e.target.value as StockStatus | ""); setPage(1); }}
          containerClassName="sm:w-44"
        />
      </div>

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : isError ? (
          <ErrorState title="Unable to load inventory" onRetry={refetch} />
        ) : !data?.items.length ? (
          <EmptyState title="No products found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <Table
              columns={columns}
              data={data.items}
              rowKey={(p) => p.id}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={(p) => navigate(`/products/${p.id}`)}
            />
            <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>

      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        productId={adjustProduct?.id}
      />
    </div>
  );
}
