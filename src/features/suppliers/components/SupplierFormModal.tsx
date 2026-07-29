import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateSupplier, useUpdateSupplier } from "../hooks";
import type { Supplier } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Supplier name is required"),
  contactPerson: z.string().trim().min(2, "Contact person is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(4, "Address is required"),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function SupplierFormModal({ isOpen, onClose, supplier }: SupplierFormModalProps) {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const isEdit = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contactPerson: "", phone: "", email: "", address: "", status: "active" },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        supplier
          ? { name: supplier.name, contactPerson: supplier.contactPerson, phone: supplier.phone, email: supplier.email, address: supplier.address, status: supplier.status }
          : { name: "", contactPerson: "", phone: "", email: "", address: "", status: "active" },
      );
    }
  }, [isOpen, supplier, reset]);

  function onSubmit(values: FormValues) {
    if (isEdit && supplier) {
      updateSupplier.mutate({ id: supplier.id, input: values }, { onSuccess: onClose });
    } else {
      createSupplier.mutate(values, { onSuccess: onClose });
    }
  }

  const isSubmitting = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Supplier" : "Add Supplier"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Save Supplier
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Supplier Name" error={errors.name?.message} {...register("name")} />
        <Input label="Contact Person" error={errors.contactPerson?.message} {...register("contactPerson")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Phone Number" error={errors.phone?.message} {...register("phone")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        </div>
        <Textarea label="Address" error={errors.address?.message} {...register("address")} />
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
