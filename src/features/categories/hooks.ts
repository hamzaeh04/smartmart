import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryInput,
} from "@/services/categoryService";
import { toast } from "@/store/toastStore";

export function useCategories(search?: string) {
  return useQuery({
    queryKey: ["categories", search],
    queryFn: () => listCategories(search),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ variant: "success", title: "Category created", description: `"${category.name}" has been added.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to create category", description: err.message }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) => updateCategory(id, input),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ variant: "success", title: "Category updated", description: `"${category.name}" has been saved.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to update category", description: err.message }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ variant: "success", title: "Category deleted" });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to delete category", description: err.message }),
  });
}
