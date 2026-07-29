import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { CategoryFormModal } from "@/features/categories/components/CategoryFormModal";
import { useCategories, useDeleteCategory } from "@/features/categories/hooks";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils/format";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const { can } = useAuth();
  const canManage = can("categories.manage");
  const [search, setSearch] = useState("");
  const [formTarget, setFormTarget] = useState<Category | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useCategories(search);
  const deleteCategory = useDeleteCategory();

  const columns: Column<Category>[] = [
    { key: "name", header: "Category", render: (c) => <span className="font-medium text-slate-800">{c.name}</span> },
    { key: "productCount", header: "Products", render: (c) => <span className="tabular-nums">{c.productCount}</span> },
    { key: "status", header: "Status", render: (c) => <Badge variant={c.status === "active" ? "success" : "neutral"}>{c.status}</Badge> },
    { key: "createdAt", header: "Created", render: (c) => <span className="text-slate-500">{formatDate(c.createdAt)}</span> },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (c: Category) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" aria-label="Edit category" onClick={() => setFormTarget(c)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete category" onClick={() => setDeleteTarget(c)}>
                  <Trash2 className="size-4 text-danger-500" />
                </Button>
              </div>
            ),
          } satisfies Column<Category>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organize your products into categories.</p>
        </div>
        {canManage && (
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setFormTarget("new")}>
            Add Category
          </Button>
        )}
      </div>

      <ProductSearch value={search} onChange={setSearch} placeholder="Search categories..." className="sm:max-w-xs" />

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : !categories.length ? (
          <EmptyState
            title="No categories found"
            description={search ? "Try a different search term." : "Create your first category to organize products."}
            actionLabel={canManage && !search ? "Add Category" : undefined}
            onAction={() => setFormTarget("new")}
          />
        ) : (
          <Table columns={columns} data={categories} rowKey={(c) => c.id} />
        )}
      </div>

      <CategoryFormModal
        isOpen={formTarget !== null}
        onClose={() => setFormTarget(null)}
        category={formTarget && formTarget !== "new" ? formTarget : null}
      />

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCategory.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        title="Delete this category?"
        description={
          deleteTarget && deleteTarget.productCount > 0
            ? `"${deleteTarget.name}" is assigned to ${deleteTarget.productCount} product(s) and cannot be deleted until those products are reassigned or removed.`
            : `"${deleteTarget?.name}" will be permanently deleted.`
        }
        confirmLabel="Delete Category"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
