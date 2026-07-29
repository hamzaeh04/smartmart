import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateUser, useUpdateUser } from "../hooks";
import { useAuth } from "@/hooks/useAuth";
import type { Role, User } from "@/types";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
];

const baseSchema = {
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["admin", "manager", "cashier"]),
  status: z.enum(["active", "inactive"]),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
};

const createSchema = z
  .object(baseSchema)
  .refine((data) => (data.password?.length ?? 0) >= 6, { message: "Minimum 6 characters", path: ["password"] })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const editSchema = z.object(baseSchema).refine(
  (data) => !data.password || data.password === data.confirmPassword,
  { message: "Passwords do not match", path: ["confirmPassword"] },
);

type FormValues = z.infer<typeof editSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  const { user: currentUser } = useAuth();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEdit = !!user;
  const isSelf = user?.id === currentUser?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { fullName: "", email: "", role: "cashier", status: "active", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        user
          ? { fullName: user.fullName, email: user.email, role: user.role, status: user.status, password: "", confirmPassword: "" }
          : { fullName: "", email: "", role: "cashier", status: "active", password: "", confirmPassword: "" },
      );
    }
  }, [isOpen, user, reset]);

  function onSubmit(values: FormValues) {
    const { confirmPassword: _confirmPassword, ...rest } = values;
    if (isEdit && user) {
      const payload = { ...rest, password: rest.password || undefined };
      updateUser.mutate({ id: user.id, input: payload }, { onSuccess: onClose });
    } else {
      createUser.mutate(rest, { onSuccess: onClose });
    }
  }

  const isSubmitting = createUser.isPending || updateUser.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add User"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Save User
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Role" options={ROLE_OPTIONS} disabled={isSelf} hint={isSelf ? "You cannot change your own role" : undefined} {...register("role")} />
          <Select
            label="Status"
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
            disabled={isSelf}
            hint={isSelf ? "You cannot deactivate yourself" : undefined}
            {...register("status")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={isEdit ? "New Password (optional)" : "Password"}
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input label="Confirm Password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        </div>
      </form>
    </Modal>
  );
}
