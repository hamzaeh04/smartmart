import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, History, Pencil, Printer, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { QrCodeDisplay, getQrCodeDataUrl } from "@/components/ui/QrCodeDisplay";
import { BarcodeDisplay } from "@/components/ui/BarcodeDisplay";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StockStatusBadge } from "@/features/inventory/components/StockStatusBadge";
import { StockAdjustmentModal } from "@/features/inventory/components/StockAdjustmentModal";
import { ProductLabelModal } from "@/features/products/components/ProductLabelModal";
import { useProduct } from "@/features/products/hooks";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/utils/format";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !product) {
    return <ErrorState title="Product not found" description="This product may have been deleted." onRetry={refetch} />;
  }

  async function handleDownloadQr() {
    if (!product) return;
    const dataUrl = await getQrCodeDataUrl(product.qrCode, 400);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${product.sku}-qr.png`;
    link.click();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Back to Products
        </button>
        <div className="flex flex-wrap gap-2">
          {can("inventory.manage") && (
            <Button variant="outline" size="sm" leftIcon={<SlidersHorizontal className="size-4" />} onClick={() => setAdjustOpen(true)}>
              Adjust Stock
            </Button>
          )}
          <Button variant="outline" size="sm" leftIcon={<History className="size-4" />} onClick={() => navigate(`/inventory/history?productId=${product.id}`)}>
            Stock History
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Printer className="size-4" />} onClick={() => setLabelOpen(true)}>
            Print Label
          </Button>
          {can("products.manage") && (
            <Button size="sm" leftIcon={<Pencil className="size-4" />} onClick={() => navigate(`/products/${product.id}/edit`)}>
              Edit Product
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <img src={product.image} alt={product.name} className="aspect-square w-full rounded-lg object-cover" />
            <div className="flex items-center gap-2">
              <Badge variant={product.status === "active" ? "success" : "neutral"}>{product.status}</Badge>
              <StockStatusBadge currentStock={product.currentStock} minimumStock={product.minimumStock} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title={product.name} subtitle={product.category} />
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <Field label="SKU" value={product.sku} />
              <Field label="Barcode" value={product.barcode} />
              <Field label="QR Value" value={product.qrCode} />
              <Field label="Purchase Price" value={formatCurrency(product.purchasePrice)} />
              <Field label="Selling Price" value={formatCurrency(product.sellingPrice)} emphasize />
              <Field label="Current Stock" value={`${product.currentStock} ${product.unit}`} />
              <Field label="Minimum Stock" value={`${product.minimumStock} ${product.unit}`} />
              <Field label="Supplier" value={product.supplier ?? "—"} />
              <Field label="Created" value={formatDate(product.createdAt)} />
              <Field label="Last Updated" value={formatDate(product.updatedAt)} />
            </CardContent>
            {product.description && (
              <CardContent className="border-t border-slate-100">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
                <p className="mt-1.5 text-sm text-slate-600">{product.description}</p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader title="Codes" subtitle="Used for scanning at POS and inventory checks" />
            <CardContent className="flex flex-wrap items-center gap-8">
              <div className="text-center">
                <QrCodeDisplay value={product.qrCode} size={128} />
                <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Download className="size-3.5" />} onClick={handleDownloadQr}>
                  Download QR
                </Button>
              </div>
              <div>
                <BarcodeDisplay value={product.barcode} height={70} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <StockAdjustmentModal isOpen={adjustOpen} onClose={() => setAdjustOpen(false)} productId={product.id} />
      <ProductLabelModal isOpen={labelOpen} onClose={() => setLabelOpen(false)} product={product} />
    </div>
  );
}

function Field({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={emphasize ? "mt-0.5 text-sm font-semibold text-brand-700" : "mt-0.5 text-sm text-slate-700"}>{value}</p>
    </div>
  );
}
