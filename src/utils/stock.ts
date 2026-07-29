import type { StockStatus } from "@/types";

export function getStockStatus(currentStock: number, minimumStock: number): StockStatus {
  if (currentStock <= 0) return "out-of-stock";
  if (currentStock <= minimumStock) return "low-stock";
  return "in-stock";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};
