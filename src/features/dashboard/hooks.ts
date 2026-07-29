import { useQuery } from "@tanstack/react-query";
import {
  getLowStockProducts,
  getProfitSummary,
  getRecentSales,
  getSalesOverview,
  getSummary,
  getTopSellingProducts,
} from "@/services/dashboardService";
import type { DateRange, SalesOverviewPeriod } from "@/services/dashboardService";

export function useDashboardSummary(range: DateRange) {
  return useQuery({ queryKey: ["dashboard", "summary", range], queryFn: () => getSummary(range) });
}

export function useProfitSummary(range: DateRange) {
  return useQuery({ queryKey: ["dashboard", "profit-summary", range], queryFn: () => getProfitSummary(range) });
}

export function useSalesOverview(period: SalesOverviewPeriod) {
  return useQuery({ queryKey: ["dashboard", "sales-overview", period], queryFn: () => getSalesOverview(period) });
}

export function useTopSellingProducts(limit = 5) {
  return useQuery({ queryKey: ["dashboard", "top-products", limit], queryFn: () => getTopSellingProducts(limit) });
}

export function useLowStockProducts(limit = 5) {
  return useQuery({ queryKey: ["dashboard", "low-stock", limit], queryFn: () => getLowStockProducts(limit) });
}

export function useRecentSales(limit = 6) {
  return useQuery({ queryKey: ["dashboard", "recent-sales", limit], queryFn: () => getRecentSales(limit) });
}
