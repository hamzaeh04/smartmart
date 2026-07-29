import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useCategories } from "@/features/categories/hooks";
import { useQuery } from "@tanstack/react-query";
import { listSuppliers } from "@/services/supplierService";
import { generateBarcode, generateQrValue, generateSku } from "@/utils/id";
import type { Product, Unit } from "@/types";

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: "pc", label: "Piece (pc)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Litre (l)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
];

const schema = z.object({
  image: z.string().optional(),
  name: z.string().trim().min(2, "Product name is required"),
  categoryId: z.string().min(1, "Select a category"),
  sku: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  qrCode: z.string().trim().optional(),
  description: z.string().trim().optional(),
  purchasePrice: z.coerce.number().min(0, "Must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  currentStock: z.coerce.number().int("Whole numbers only").min(0, "Cannot be negative"),
  minimumStock: z.coerce.number().int("Whole numbers only").min(0, "Cannot be negative"),
  unit: z.enum(["pc", "kg", "g", "l", "ml", "box", "pack"]),
  supplierId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export type ProductFormInput = z.input<typeof schema>;
export type ProductFormValues = z.output<typeof schema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: { field?: "sku" | "barcode"; message: string } | null;
}

export function ProductForm({ product, onSubmit, onCancel, isSubmitting, serverError }: ProductFormProps) {
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: () => listSuppliers() });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          image: product.image,
          name: product.name,
          categoryId: product.categoryId,
          sku: product.sku,
          barcode: product.barcode,
          qrCode: product.qrCode,
          description: product.description ?? "",
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          currentStock: product.currentStock,
          minimumStock: product.minimumStock,
          unit: product.unit,
          supplierId: product.supplierId ?? "",
          status: product.status,
        }
      : {
          image: "",
          name: "",
          categoryId: "",
          sku: "",
          barcode: "",
          qrCode: "",
          description: "",
          purchasePrice: 0,
          sellingPrice: 0,
          currentStock: 0,
          minimumStock: 5,
          unit: "pc",
          supplierId: "",
          status: "active",
        },
  });

  const [preview, setPreview] = useState(product?.image ?? "");
  const categoryId = watch("categoryId");
  const isEdit = !!product;

  useEffect(() => {
    if (serverError?.field) {
      setError(serverError.field, { message: serverError.message });
    }
  }, [serverError, setError]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setValue("image", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleGenerateSku() {
    const category = categories.find((c) => c.id === categoryId);
    setValue("sku", generateSku(category?.name ?? "GEN", Math.floor(Date.now() / 1000) % 100000));
  }

  function handleGenerateBarcode() {
    setValue("barcode", generateBarcode());
  }

  function handleGenerateQr() {
    setValue("qrCode", generateQrValue(Math.floor(Date.now() / 1000) % 1000000));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader title="Product Information" subtitle="Basic details shoppers and staff will see" />
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-brand-400 hover:text-brand-500"
            >
              {preview ? (
                <img src={preview} alt="Product preview" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-6" />
              )}
            </button>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Upload Image
              </Button>
              <p className="mt-1.5 text-xs text-slate-400">PNG or JPG, square image recommended.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Product Name" error={errors.name?.message} {...register("name")} />
            <Select
              label="Category"
              placeholder="Select category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.categoryId?.message}
              {...register("categoryId")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="SKU"
              placeholder="Auto-generated if left blank"
              error={errors.sku?.message}
              rightElement={
                <button type="button" onClick={handleGenerateSku} aria-label="Generate SKU" className="rounded p-1 text-slate-400 hover:text-brand-600">
                  <RefreshCw className="size-4" />
                </button>
              }
              {...register("sku")}
            />
            <Input
              label="Barcode"
              placeholder="Auto-generated if left blank"
              error={errors.barcode?.message}
              rightElement={
                <button type="button" onClick={handleGenerateBarcode} aria-label="Generate barcode" className="rounded p-1 text-slate-400 hover:text-brand-600">
                  <RefreshCw className="size-4" />
                </button>
              }
              {...register("barcode")}
            />
            <Input
              label="QR Code Value"
              placeholder="Auto-generated if left blank"
              disabled={isEdit}
              hint={isEdit ? "QR values cannot be changed after creation" : undefined}
              rightElement={
                !isEdit && (
                  <button type="button" onClick={handleGenerateQr} aria-label="Generate QR value" className="rounded p-1 text-slate-400 hover:text-brand-600">
                    <RefreshCw className="size-4" />
                  </button>
                )
              }
              {...register("qrCode")}
            />
          </div>

          <Select
            label="Supplier (optional)"
            placeholder="No supplier assigned"
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            {...register("supplierId")}
          />

          <Textarea label="Description" placeholder="Short product description..." {...register("description")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Pricing" subtitle="Purchase cost and retail price" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Purchase Price"
            type="number"
            step="0.01"
            min={0}
            error={errors.purchasePrice?.message}
            {...register("purchasePrice")}
          />
          <Input
            label="Selling Price"
            type="number"
            step="0.01"
            min={0}
            error={errors.sellingPrice?.message}
            {...register("sellingPrice")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Inventory" subtitle="Stock levels and unit of measurement" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Current Stock"
            type="number"
            min={0}
            disabled={isEdit}
            hint={isEdit ? "Use Adjust Stock to change quantity" : undefined}
            error={errors.currentStock?.message}
            {...register("currentStock")}
          />
          <Input
            label="Minimum Stock Level"
            type="number"
            min={0}
            error={errors.minimumStock?.message}
            {...register("minimumStock")}
          />
          <Select label="Unit of Measurement" options={UNIT_OPTIONS} {...register("unit")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Status" />
        <CardContent>
          <div className="flex gap-3">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" value="active" className="text-brand-600" {...register("status")} />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" value="inactive" className="text-brand-600" {...register("status")} />
              <span className="text-sm font-medium text-slate-700">Inactive</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Product
        </Button>
      </div>
    </form>
  );
}
