import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  lookupProduct,
  updateProduct,
  type ProductFilters,
  type ProductInput,
} from "@/services/productService";
import { toast } from "@/store/toastStore";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProducts(filters),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProduct(id as string),
    enabled: !!id,
  });
}

export function useProductLookup() {
  return useMutation({ mutationFn: (code: string) => lookupProduct(code) });
}

function invalidateProductQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["categories"] });
  queryClient.invalidateQueries({ queryKey: ["inventory"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: (product) => {
      invalidateProductQueries(queryClient);
      toast({ variant: "success", title: "Product created", description: `${product.name} has been added.` });
    },
    onError: (err: Error) => {
      toast({ variant: "error", title: "Unable to create product", description: err.message });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) => updateProduct(id, input),
    onSuccess: (product) => {
      invalidateProductQueries(queryClient);
      toast({ variant: "success", title: "Product updated", description: `${product.name} has been saved.` });
    },
    onError: (err: Error) => {
      toast({ variant: "error", title: "Unable to update product", description: err.message });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      invalidateProductQueries(queryClient);
      toast({ variant: "success", title: "Product deleted" });
    },
    onError: (err: Error) => {
      toast({ variant: "error", title: "Unable to delete product", description: err.message });
    },
  });
}
