import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkout, type CheckoutInput } from "@/services/saleService";
import { getSettings } from "@/services/settingsService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toastStore";

export function useStoreSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: getSettings, staleTime: 5 * 60_000 });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: CheckoutInput) => checkout(input, { userId: user?.id ?? "", userName: user?.fullName ?? "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-history"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: Error) => {
      toast({ variant: "error", title: "Unable to complete sale", description: err.message });
    },
  });
}
