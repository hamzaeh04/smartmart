import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPurchase,
  completePurchase,
  createPurchase,
  getPurchase,
  listPurchases,
  type PurchaseFilters,
  type PurchaseInput,
} from "@/services/purchaseService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toastStore";

export function usePurchases(filters: PurchaseFilters) {
  return useQuery({ queryKey: ["purchases", filters], queryFn: () => listPurchases(filters) });
}

export function usePurchase(id: string | undefined) {
  return useQuery({
    queryKey: ["purchases", id],
    queryFn: () => getPurchase(id as string),
    enabled: !!id,
  });
}

function invalidateAfterPurchaseChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["purchases"] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["inventory"] });
  queryClient.invalidateQueries({ queryKey: ["stock-history"] });
  queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: PurchaseInput) =>
      createPurchase(input, { userId: user?.id ?? "", userName: user?.fullName ?? "" }),
    onSuccess: (purchase) => {
      invalidateAfterPurchaseChange(queryClient);
      toast({
        variant: "success",
        title: purchase.status === "completed" ? "Purchase completed" : "Purchase saved as draft",
        description: `${purchase.purchaseNumber} — ${purchase.items.length} item(s).`,
      });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to save purchase", description: err.message }),
  });
}

export function useCompletePurchase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => completePurchase(id, { userId: user?.id ?? "", userName: user?.fullName ?? "" }),
    onSuccess: (purchase) => {
      invalidateAfterPurchaseChange(queryClient);
      toast({ variant: "success", title: "Purchase completed", description: `${purchase.purchaseNumber} received into inventory.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to complete purchase", description: err.message }),
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelPurchase(id),
    onSuccess: () => {
      invalidateAfterPurchaseChange(queryClient);
      toast({ variant: "success", title: "Purchase cancelled" });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to cancel purchase", description: err.message }),
  });
}
