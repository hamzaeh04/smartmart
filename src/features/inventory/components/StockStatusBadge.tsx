import { Badge } from "@/components/ui/Badge";
import { getStockStatus, STOCK_STATUS_LABEL } from "@/utils/stock";
import type { BadgeVariant } from "@/components/ui/Badge";

const VARIANT_BY_STATUS: Record<ReturnType<typeof getStockStatus>, BadgeVariant> = {
  "in-stock": "success",
  "low-stock": "warning",
  "out-of-stock": "danger",
};

export function StockStatusBadge({ currentStock, minimumStock }: { currentStock: number; minimumStock: number }) {
  const status = getStockStatus(currentStock, minimumStock);
  return (
    <Badge variant={VARIANT_BY_STATUS[status]} dot>
      {STOCK_STATUS_LABEL[status]}
    </Badge>
  );
}
