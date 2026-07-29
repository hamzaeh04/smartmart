import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StockStatusBadge } from "@/features/inventory/components/StockStatusBadge";
import { useLowStockProducts } from "../hooks";
import { PackageCheck } from "lucide-react";

export function LowStockProducts() {
  const { data, isLoading } = useLowStockProducts(5);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader title="Low-Stock Products" subtitle="Items that need restocking soon" />
      {isLoading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : !data?.length ? (
        <EmptyState
          icon={<PackageCheck className="size-6" />}
          title="All stocked up"
          description="No products are currently low or out of stock."
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((product) => (
            <li key={product.id} className="flex items-center gap-3 px-5 py-3">
              <img src={product.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{product.name}</p>
                <p className="text-xs text-slate-400">
                  {product.currentStock} in stock · min {product.minimumStock}
                </p>
              </div>
              <StockStatusBadge currentStock={product.currentStock} minimumStock={product.minimumStock} />
              <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${product.id}`)}>
                Quick View
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
