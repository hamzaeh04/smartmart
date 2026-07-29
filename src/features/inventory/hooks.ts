import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustStock,
  listInventory,
  listStockHistory,
  type InventoryFilters,
  type StockAdjustmentInput,
  type StockHistoryFilters,
} from "@/services/inventoryService";
import { toast } from "@/store/toastStore";

export function useInventory(filters: InventoryFilters) {
  return useQuery({
    queryKey: ["inventory", filters],
    queryFn: () => listInventory(filters),
  });
}

export function useStockHistory(filters: StockHistoryFilters) {
  return useQuery({
    queryKey: ["stock-history", filters],
    queryFn: () => listStockHistory(filters),
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockAdjustmentInput) => adjustStock(input),
    onSuccess: ({ product }) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-history"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        variant: "success",
        title: "Stock adjustment saved",
        description: `${product.name} is now at ${product.currentStock} unit(s).`,
      });
    },
    onError: (err: Error) => {
      toast({ variant: "error", title: "Unable to adjust stock", description: err.message });
    },
  });
}
