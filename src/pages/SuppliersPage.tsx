import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { SupplierFormModal } from "@/features/suppliers/components/SupplierFormModal";
import { useDeleteSupplier, useSuppliers } from "@/features/suppliers/hooks";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/format";
import type { Supplier } from "@/types";

export default function SuppliersPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can("suppliers.manage");
  const [search, setSearch] = useState("");
  const [formTarget, setFormTarget] = useState<Supplier | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useSuppliers(search);
  const deleteSupplier = useDeleteSupplier();

  const columns: Column<Supplier>[] = [
    { key: "name", header: "Supplier", render: (s) => <span className="font-medium text-slate-800">{s.name}</span> },
    { key: "contactPerson", header: "Contact Person", render: (s) => <span className="text-slate-600">{s.contactPerson}</span> },
    {
      key: "contact",
      header: "Contact Info",
      render: (s) => (
        <div className="space-y-0.5 text-xs text-slate-500">
          <p className="flex items-center gap-1"><Phone className="size-3" /> {s.phone}</p>
          <p className="flex items-center gap-1"><Mail className="size-3" /> {s.email}</p>
        </div>
      ),
    },
    { key: "totalPurchases", header: "Total Purchases", render: (s) => <span className="tabular-nums font-medium">{formatCurrency(s.totalPurchases)}</span> },
    { key: "status", header: "Status", render: (s) => <Badge variant={s.status === "active" ? "success" : "neutral"}>{s.status}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" aria-label="View supplier" onClick={() => navigate(`/suppliers/${s.id}`)}>
            <Eye className="size-4" />
          </Button>
          {canManage && (
            <>
              <Button variant="ghost" size="icon" aria-label="Edit supplier" onClick={() => setFormTarget(s)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete supplier" onClick={() => setDeleteTarget(s)}>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the vendors you purchase stock from.</p>
        </div>
        {canManage && (
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setFormTarget("new")}>
            Add Supplier
          </Button>
        )}
      </div>

      <ProductSearch value={search} onChange={setSearch} placeholder="Search suppliers..." className="sm:max-w-xs" />

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : !suppliers.length ? (
          <EmptyState
            title="No suppliers found"
            description={search ? "Try a different search term." : "Add your first supplier to start creating purchases."}
            actionLabel={canManage && !search ? "Add Supplier" : undefined}
            onAction={() => setFormTarget("new")}
          />
        ) : (
          <Table columns={columns} data={suppliers} rowKey={(s) => s.id} onRowClick={(s) => navigate(`/suppliers/${s.id}`)} />
        )}
      </div>

      <SupplierFormModal isOpen={formTarget !== null} onClose={() => setFormTarget(null)} supplier={formTarget && formTarget !== "new" ? formTarget : null} />

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteSupplier.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        title="Delete this supplier?"
        description={`"${deleteTarget?.name}" will be permanently removed. Existing purchases will keep their historical record.`}
        confirmLabel="Delete Supplier"
        isLoading={deleteSupplier.isPending}
      />
    </div>
  );
}
