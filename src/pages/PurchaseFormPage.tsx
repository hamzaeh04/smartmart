import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { listProducts } from "@/services/productService";
import { useSuppliers } from "@/features/suppliers/hooks";
import { useCreatePurchase } from "@/features/purchases/hooks";
import { formatCurrency } from "@/utils/format";
import { PackageSearch } from "lucide-react";

const itemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().int("Whole numbers only").min(1, "Min 1"),
  purchasePrice: z.coerce.number().min(0, "Must be 0 or more"),
});

const schema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  purchaseDate: z.string().min(1, "Select a date"),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]),
  notes: z.string().trim().optional(),
  discount: z.coerce.number().min(0, "Must be 0 or more"),
  items: z.array(itemSchema).min(1, "Add at least one product"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const todayIso = new Date().toISOString().slice(0, 10);

export default function PurchaseFormPage() {
  const navigate = useNavigate();
  const { data: suppliers = [] } = useSuppliers();
  const { data: productsPage } = useQuery({
    queryKey: ["products-all-for-purchase"],
    queryFn: () => listProducts({ pageSize: 500, sortKey: "name", sortDirection: "asc" }),
  });
  const products = productsPage?.items ?? [];
  const createPurchase = useCreatePurchase();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      purchaseDate: todayIso,
      paymentStatus: "unpaid",
      notes: "",
      discount: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const watchedDiscount = watch("discount");

  const subtotal = useMemo(
    () => (watchedItems ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0), 0),
    [watchedItems],
  );
  const total = Math.max(0, subtotal - (Number(watchedDiscount) || 0));

  function submitAs(status: "draft" | "completed") {
    return handleSubmit((values) => {
      createPurchase.mutate(
        { ...values, status },
        { onSuccess: (purchase) => navigate(`/purchases/${purchase.id}`) },
      );
    });
  }

  function productStock(productId: string) {
    return products.find((p) => p.id === productId)?.currentStock ?? 0;
  }

  function handleAddItem() {
    const firstUnused = products.find((p) => !watchedItems?.some((i) => i.productId === p.id));
    append({ productId: firstUnused?.id ?? "", quantity: 1, purchasePrice: firstUnused?.purchasePrice ?? 0 });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to Purchases
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Purchase</h1>
        <p className="mt-1 text-sm text-slate-500">Purchase number will be generated automatically on save.</p>
      </div>

      <Card>
        <CardHeader title="Purchase Details" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Supplier" placeholder="Select supplier" options={suppliers.map((s) => ({ value: s.id, label: s.name }))} error={errors.supplierId?.message} {...register("supplierId")} />
          <Input label="Purchase Date" type="date" error={errors.purchaseDate?.message} {...register("purchaseDate")} />
          <Select
            label="Payment Status"
            options={[{ value: "unpaid", label: "Unpaid" }, { value: "partial", label: "Partially Paid" }, { value: "paid", label: "Paid" }]}
            {...register("paymentStatus")}
          />
          <div className="sm:col-span-2">
            <Textarea label="Notes (optional)" {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Products"
          subtitle="Add the products included in this purchase"
          action={
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="size-4" />} onClick={handleAddItem}>
              Add Product
            </Button>
          }
        />
        <CardContent>
          {fields.length === 0 ? (
            <EmptyState icon={<PackageSearch className="size-6" />} title="No products added" description="Add at least one product to this purchase." actionLabel="Add Product" onAction={handleAddItem} />
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedId = watchedItems?.[index]?.productId;
                const qty = Number(watchedItems?.[index]?.quantity) || 0;
                const price = Number(watchedItems?.[index]?.purchasePrice) || 0;
                return (
                  <div key={field.id} className="grid grid-cols-1 items-start gap-3 rounded-lg border border-slate-100 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    <Select
                      label={index === 0 ? "Product" : undefined}
                      options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                      placeholder="Select product"
                      error={errors.items?.[index]?.productId?.message}
                      {...register(`items.${index}.productId` as const)}
                    />
                    <div>
                      {index === 0 && <label className="mb-1.5 block text-sm font-medium text-slate-700">Available</label>}
                      <p className="flex h-10 items-center text-sm text-slate-500">{selectedId ? productStock(selectedId) : "—"}</p>
                    </div>
                    <Input label={index === 0 ? "Quantity" : undefined} type="number" min={1} error={errors.items?.[index]?.quantity?.message} {...register(`items.${index}.quantity` as const)} />
                    <Input label={index === 0 ? "Unit Price" : undefined} type="number" step="0.01" min={0} error={errors.items?.[index]?.purchasePrice?.message} {...register(`items.${index}.purchasePrice` as const)} />
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        {index === 0 && <label className="mb-1.5 block text-sm font-medium text-slate-700">Total</label>}
                        <p className="flex h-10 items-center text-sm font-semibold tabular-nums text-slate-800">{formatCurrency(qty * price)}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove item" onClick={() => remove(index)}>
                        <Trash2 className="size-4 text-danger-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {errors.items?.message && <p className="mt-2 text-xs text-danger-600">{errors.items.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="ml-auto max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums font-medium text-slate-800">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <Controller
              control={control}
              name="discount"
              render={({ field }) => (
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value as number}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  className="h-8 w-24 rounded-md border border-slate-200 px-2 text-right text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              )}
            />
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-bold tabular-nums text-brand-700">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="button" variant="secondary" onClick={submitAs("draft")} isLoading={createPurchase.isPending}>
          Save as Draft
        </Button>
        <Button type="button" onClick={submitAs("completed")} isLoading={createPurchase.isPending}>
          Complete Purchase
        </Button>
      </div>
    </div>
  );
}
