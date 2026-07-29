import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { StockStatusBadge } from "@/features/inventory/components/StockStatusBadge";
import { useProducts, useDeleteProduct } from "@/features/products/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useScannerStore } from "@/store/scannerStore";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/format";
import type { Product, StockStatus } from "@/types";

const STOCK_STATUS_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const openScanner = useScannerStore((s) => s.open);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus | "">("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Product | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: categories = [] } = useCategories();
  const { data, isLoading, isError, refetch } = useProducts({
    search,
    categoryId: categoryId || undefined,
    stockStatus: stockStatus || undefined,
    status: status || undefined,
    page,
    pageSize: 10,
    sortKey,
    sortDirection,
  });
  const deleteProduct = useDeleteProduct();
  const canManage = can("products.manage");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
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
            <p className="text-xs text-slate-400">{p.category}</p>
          </div>
        </div>
      ),
    },
    { key: "sku", header: "SKU", render: (p) => <span className="text-slate-500">{p.sku}</span> },
    { key: "barcode", header: "Barcode", render: (p) => <span className="text-slate-500">{p.barcode}</span> },
    {
      key: "purchasePrice",
      header: "Purchase Price",
      sortable: true,
      render: (p) => <span className="tabular-nums">{formatCurrency(p.purchasePrice)}</span>,
    },
    {
      key: "sellingPrice",
      header: "Selling Price",
      sortable: true,
      render: (p) => <span className="tabular-nums font-medium text-slate-800">{formatCurrency(p.sellingPrice)}</span>,
    },
    {
      key: "currentStock",
      header: "Stock",
      sortable: true,
      render: (p) => <span className="tabular-nums">{p.currentStock} {p.unit}</span>,
    },
    {
      key: "stockStatus",
      header: "Stock Status",
      render: (p) => <StockStatusBadge currentStock={p.currentStock} minimumStock={p.minimumStock} />,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge variant={p.status === "active" ? "success" : "neutral"}>{p.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" aria-label="View product" onClick={() => navigate(`/products/${p.id}`)}>
            <Eye className="size-4" />
          </Button>
          {canManage && (
            <>
              <Button variant="ghost" size="icon" aria-label="Edit product" onClick={() => navigate(`/products/${p.id}/edit`)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete product" onClick={() => setDeleteTarget(p)}>
                <Trash2 className="size-4 text-danger-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your product catalog, pricing, and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<QrCode className="size-4" />} onClick={() => openScanner("global")}>
            Scan Product
          </Button>
          {canManage && (
            <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate("/products/new")}>
              Add Product
            </Button>
          )}
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
        <Select
          placeholder="All Status"
          options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          value={status}
          onChange={(e) => { setStatus(e.target.value as "active" | "inactive" | ""); setPage(1); }}
          containerClassName="sm:w-36"
        />
      </div>

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={8} cols={9} />
        ) : isError ? (
          <ErrorState title="Unable to load products" description="Please try again." onRetry={refetch} />
        ) : !data?.items.length ? (
          <EmptyState
            title="No products found"
            description={search || categoryId || stockStatus || status ? "Try adjusting your filters." : "Get started by adding your first product."}
            actionLabel={canManage && !search && !categoryId ? "Create Your First Product" : undefined}
            onAction={() => navigate("/products/new")}
          />
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

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteProduct.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        title="Delete this product?"
        description={`"${deleteTarget?.name}" will be permanently removed from your catalog. This cannot be undone.`}
        confirmLabel="Delete Product"
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
