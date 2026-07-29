import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/services/settingsService";
import { toast } from "@/store/toastStore";
import type { StoreSettings } from "@/types";

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: getSettings });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StoreSettings>) => updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ variant: "success", title: "Settings saved", description: "Your changes have been applied." });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to save settings", description: err.message }),
  });
}
