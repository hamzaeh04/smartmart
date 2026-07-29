import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateCategory, useUpdateCategory } from "../hooks";
import type { Category } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  description: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "", status: "active" } });

  useEffect(() => {
    if (isOpen) {
      reset(category ? { name: category.name, description: category.description ?? "", status: category.status } : { name: "", description: "", status: "active" });
    }
  }, [isOpen, category, reset]);

  function onSubmit(values: FormValues) {
    if (isEdit && category) {
      updateCategory.mutate({ id: category.id, input: values }, { onSuccess: onClose });
    } else {
      createCategory.mutate(values, { onSuccess: onClose });
    }
  }

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "Add Category"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Save Category
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Category Name" error={errors.name?.message} {...register("name")} />
        <Textarea label="Description" placeholder="Optional description..." {...register("description")} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <div className="flex gap-3">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" value="active" {...register("status")} />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" value="inactive" {...register("status")} />
              <span className="text-sm font-medium text-slate-700">Inactive</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
