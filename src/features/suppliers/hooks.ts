import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSupplierPurchases,
  listSuppliers,
  updateSupplier,
  type SupplierInput,
} from "@/services/supplierService";
import { toast } from "@/store/toastStore";

export function useSuppliers(search?: string) {
  return useQuery({ queryKey: ["suppliers", search], queryFn: () => listSuppliers(search) });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => getSupplier(id as string),
    enabled: !!id,
  });
}

export function useSupplierPurchases(id: string | undefined) {
  return useQuery({
    queryKey: ["suppliers", id, "purchases"],
    queryFn: () => getSupplierPurchases(id as string),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) => createSupplier(input),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ variant: "success", title: "Supplier added", description: `${supplier.name} has been added.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to add supplier", description: err.message }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SupplierInput> }) => updateSupplier(id, input),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ variant: "success", title: "Supplier updated", description: `${supplier.name} has been saved.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to update supplier", description: err.message }),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ variant: "success", title: "Supplier deleted" });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to delete supplier", description: err.message }),
  });
}
