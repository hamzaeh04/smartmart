import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useCreateProduct, useProduct, useUpdateProduct } from "@/features/products/hooks";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { ProductFormValues } from "@/features/products/components/ProductForm";

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [serverError, setServerError] = useState<{ field?: "sku" | "barcode"; message: string } | null>(null);

  if (isEdit && isLoading) return <LoadingSpinner />;
  if (isEdit && (isError || !product)) {
    return <ErrorState title="Product not found" description="This product may have been deleted." onRetry={refetch} />;
  }

  function handleSubmit(values: ProductFormValues) {
    setServerError(null);
    const payload = { ...values, image: values.image ?? "", supplierId: values.supplierId || undefined };

    if (isEdit && product) {
      updateProduct.mutate(
        { id: product.id, input: payload },
        {
          onSuccess: () => navigate(`/products/${product.id}`),
          onError: (err: Error) => {
            if (err.message.toLowerCase().includes("sku")) setServerError({ field: "sku", message: err.message });
            else if (err.message.toLowerCase().includes("barcode")) setServerError({ field: "barcode", message: err.message });
          },
        },
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: (created) => navigate(`/products/${created.id}`),
        onError: (err: Error) => {
          if (err.message.toLowerCase().includes("sku")) setServerError({ field: "sku", message: err.message });
          else if (err.message.toLowerCase().includes("barcode")) setServerError({ field: "barcode", message: err.message });
        },
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit ? "Update product details, pricing, and status." : "Create a new product in your catalog."}
        </p>
      </div>

      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
        serverError={serverError}
      />
    </div>
  );
}
