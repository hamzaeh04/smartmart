import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { PackagePlus, PackageMinus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { listProducts } from "@/services/productService";
import { useAdjustStock } from "../hooks";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

const schema = z.object({
  productId: z.string().min(1, "Select a product"),
  type: z.enum(["add", "remove"]),
  quantity: z.coerce.number().int("Enter a whole number").min(1, "Quantity must be at least 1"),
  reason: z.string().trim().min(3, "A reason is required"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
}

export function StockAdjustmentModal({ isOpen, onClose, productId }: StockAdjustmentModalProps) {
  const { user } = useAuth();
  const adjustStock = useAdjustStock();

  const { data: productsPage } = useQuery({
    queryKey: ["products-all-for-adjustment"],
    queryFn: () => listProducts({ pageSize: 500, sortKey: "name", sortDirection: "asc" }),
    enabled: isOpen,
  });
  const products = productsPage?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: productId ?? "", type: "add", quantity: 1, reason: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ productId: productId ?? "", type: "add", quantity: 1, reason: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId]);

  const watchedProductId = watch("productId");
  const watchedType = watch("type");
  const watchedQuantity = watch("quantity");

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === watchedProductId),
    [products, watchedProductId],
  );

  const newQuantity = selectedProduct
    ? watchedType === "add"
      ? selectedProduct.currentStock + (Number(watchedQuantity) || 0)
      : selectedProduct.currentStock - (Number(watchedQuantity) || 0)
    : undefined;

  function handleClose() {
    reset({ productId: productId ?? "", type: "add", quantity: 1, reason: "" });
    onClose();
  }

  function onSubmit(values: FormValues) {
    if (!user) return;
    adjustStock.mutate(
      { ...values, userId: user.id, userName: user.fullName },
      { onSuccess: handleClose },
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adjust Stock"
      description="Record a manual stock increase or decrease with a reason."
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={adjustStock.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={adjustStock.isPending}>
            Save Adjustment
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Select
          label="Product"
          placeholder="Select a product"
          disabled={!!productId}
          options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
          error={errors.productId?.message}
          {...register("productId")}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Adjustment Type</label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => field.onChange("add")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                    field.value === "add"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50",
                  )}
                >
                  <PackagePlus className="size-4" /> Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange("remove")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                    field.value === "remove"
                      ? "border-danger-500 bg-danger-50 text-danger-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50",
                  )}
                >
                  <PackageMinus className="size-4" /> Remove Stock
                </button>
              </div>
            )}
          />
        </div>

        <Input
          label="Quantity"
          type="number"
          min={1}
          error={errors.quantity?.message}
          {...register("quantity")}
        />

        {selectedProduct && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Current Quantity</p>
              <p className="font-semibold text-slate-700">{selectedProduct.currentStock}</p>
            </div>
            <span className="text-slate-300">→</span>
            <div className="text-right">
              <p className="text-xs text-slate-400">New Quantity</p>
              <p
                className={cn(
                  "font-semibold",
                  newQuantity !== undefined && newQuantity < 0 ? "text-danger-600" : "text-brand-700",
                )}
              >
                {newQuantity ?? "—"}
              </p>
            </div>
          </div>
        )}
        {newQuantity !== undefined && newQuantity < 0 && (
          <p className="text-xs text-danger-600">Stock cannot become negative. Reduce the quantity.</p>
        )}

        <Textarea
          label="Reason"
          placeholder="e.g. Damaged packaging, stocktake correction, theft..."
          error={errors.reason?.message}
          {...register("reason")}
        />
      </form>
    </Modal>
  );
}
