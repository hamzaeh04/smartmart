import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const outOfStock = product.currentStock <= 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={outOfStock}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition-all",
        outOfStock ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md",
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="size-full object-cover" />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
            <Badge variant="danger">Out of Stock</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-xs font-medium leading-tight text-slate-700">{product.name}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold text-brand-700">{formatCurrency(product.sellingPrice)}</span>
          {!outOfStock && <span className="text-[11px] text-slate-400">{product.currentStock} left</span>}
        </div>
      </div>
    </button>
  );
}
