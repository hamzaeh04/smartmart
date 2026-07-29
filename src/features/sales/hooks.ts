import { useQuery } from "@tanstack/react-query";
import { getSale, listSales, type SaleFilters } from "@/services/saleService";

export function useSales(filters: SaleFilters) {
  return useQuery({ queryKey: ["sales", filters], queryFn: () => listSales(filters) });
}

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => getSale(id as string),
    enabled: !!id,
  });
}
