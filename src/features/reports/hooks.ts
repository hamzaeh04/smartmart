import { useQuery } from "@tanstack/react-query";
import {
  getDailySalesReport,
  getInventoryReport,
  getLowStockReport,
  getProductSalesReport,
  getPurchaseReport,
  type ReportDateRange,
} from "@/services/reportService";

export function useDailySalesReport(range: ReportDateRange) {
  return useQuery({ queryKey: ["reports", "daily-sales", range], queryFn: () => getDailySalesReport(range) });
}

export function useProductSalesReport(range: ReportDateRange & { categoryId?: string; productId?: string }) {
  return useQuery({ queryKey: ["reports", "product-sales", range], queryFn: () => getProductSalesReport(range) });
}

export function useInventoryReport(categoryId?: string) {
  return useQuery({ queryKey: ["reports", "inventory", categoryId], queryFn: () => getInventoryReport(categoryId) });
}

export function useLowStockReport() {
  return useQuery({ queryKey: ["reports", "low-stock"], queryFn: () => getLowStockReport() });
}

export function usePurchaseReport(range: ReportDateRange & { supplierId?: string }) {
  return useQuery({ queryKey: ["reports", "purchases", range], queryFn: () => getPurchaseReport(range) });
}
