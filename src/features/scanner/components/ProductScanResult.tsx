import { AlertTriangle, History, Pencil, Printer, RotateCcw, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StockStatusBadge } from "@/features/inventory/components/StockStatusBadge";
import { formatCurrency, formatDate } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

interface ProductScanResultProps {
  product: Product;
  showAddToCart: boolean;
  onAddToCart: () => void;
  onEdit: () => void;
  onAdjustStock: () => void;
  onViewHistory: () => void;
  onPrintLabel: () => void;
  onScanAgain: () => void;
  onClose: () => void;
}

export function ProductScanResult({
  product,
  showAddToCart,
  onAddToCart,
  onEdit,
  onAdjustStock,
  onViewHistory,
  onPrintLabel,
  onScanAgain,
  onClose,
}: ProductScanResultProps) {
  const { can } = useAuth();
  const outOfStock = product.currentStock <= 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <img src={product.image} alt={product.name} className="size-24 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{product.name}</p>
          <p className="text-sm text-slate-500">{product.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={product.status === "active" ? "success" : "neutral"}>{product.status}</Badge>
            <StockStatusBadge currentStock={product.currentStock} minimumStock={product.minimumStock} />
          </div>
        </div>
      </div>

      {outOfStock && showAddToCart && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">
          <AlertTriangle className="size-4 shrink-0" />
          This product is out of stock and cannot be added to the cart.
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <Field label="SKU" value={product.sku} />
        <Field label="Barcode" value={product.barcode} />
        <Field label="Purchase Price" value={formatCurrency(product.purchasePrice)} />
        <Field label="Selling Price" value={formatCurrency(product.sellingPrice)} />
        <Field label="Current Stock" value={`${product.currentStock} ${product.unit}`} />
        <Field label="Minimum Stock" value={`${product.minimumStock} ${product.unit}`} />
        <Field label="Supplier" value={product.supplier ?? "—"} />
        <Field label="Last Updated" value={formatDate(product.updatedAt)} />
      </div>

      {product.description && <p className="text-sm text-slate-600">{product.description}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        {showAddToCart && (
          <Button leftIcon={<ShoppingCart className="size-4" />} onClick={onAddToCart} disabled={outOfStock}>
            Add to POS Cart
          </Button>
        )}
        {can("products.manage") && (
          <Button variant="outline" leftIcon={<Pencil className="size-4" />} onClick={onEdit}>
            Edit Product
          </Button>
        )}
        {can("inventory.manage") && (
          <Button variant="outline" leftIcon={<SlidersHorizontal className="size-4" />} onClick={onAdjustStock}>
            Adjust Stock
          </Button>
        )}
        <Button variant="outline" leftIcon={<History className="size-4" />} onClick={onViewHistory}>
          Stock History
        </Button>
        <Button variant="outline" leftIcon={<Printer className="size-4" />} onClick={onPrintLabel}>
          Print Label
        </Button>
        <Button variant="ghost" leftIcon={<RotateCcw className="size-4" />} onClick={onScanAgain}>
          Scan Another
        </Button>
        <Button variant="ghost" leftIcon={<X className="size-4" />} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-700">{value}</p>
    </div>
  );
}
