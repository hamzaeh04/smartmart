import { useState } from "react";
import { Pencil, Plus, ShieldCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { UserFormModal } from "@/features/users/components/UserFormModal";
import { useSetUserStatus, useUsers } from "@/features/users/hooks";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/utils/format";
import type { Role, User } from "@/types";

const ROLE_VARIANT: Record<Role, "brand" | "info" | "neutral"> = {
  admin: "brand",
  manager: "info",
  cashier: "neutral",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const setStatus = useSetUserStatus();
  const [formTarget, setFormTarget] = useState<User | null | "new">(null);
  const [statusTarget, setStatusTarget] = useState<User | null>(null);

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <img src={u.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          <div>
            <p className="font-medium text-slate-800">{u.fullName}{u.id === currentUser?.id && <span className="ml-1.5 text-xs text-slate-400">(You)</span>}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (u) => <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge> },
    { key: "status", header: "Status", render: (u) => <Badge variant={u.status === "active" ? "success" : "neutral"}>{u.status}</Badge> },
    { key: "lastLogin", header: "Last Login", render: (u) => <span className="text-slate-500">{u.lastLogin ? formatRelativeTime(u.lastLogin) : "Never"}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => {
        const isSelf = u.id === currentUser?.id;
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" aria-label="Edit user" onClick={() => setFormTarget(u)}>
              <Pencil className="size-4" />
            </Button>
            {isSelf ? (
              <Tooltip content="You cannot change your own access">
                <Button variant="ghost" size="icon" disabled aria-label="Cannot change own status">
                  <ShieldCheck className="size-4 text-slate-300" />
                </Button>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="icon" aria-label={u.status === "active" ? "Deactivate user" : "Activate user"} onClick={() => setStatusTarget(u)}>
                {u.status === "active" ? <UserX className="size-4 text-danger-500" /> : <ShieldCheck className="size-4 text-brand-600" />}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage staff accounts and access levels.</p>
        </div>
        <Button leftIcon={<Plus className="size-4" />} onClick={() => setFormTarget("new")}>
          Add User
        </Button>
      </div>

      <div className="rounded-card border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : !users.length ? (
          <EmptyState title="No users found" actionLabel="Add User" onAction={() => setFormTarget("new")} />
        ) : (
          <Table columns={columns} data={users} rowKey={(u) => u.id} />
        )}
      </div>

      <UserFormModal isOpen={formTarget !== null} onClose={() => setFormTarget(null)} user={formTarget && formTarget !== "new" ? formTarget : null} />

      <ConfirmationDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) {
            setStatus.mutate(
              { id: statusTarget.id, status: statusTarget.status === "active" ? "inactive" : "active" },
              { onSuccess: () => setStatusTarget(null) },
            );
          }
        }}
        title={statusTarget?.status === "active" ? "Deactivate this user?" : "Activate this user?"}
        description={
          statusTarget?.status === "active"
            ? `${statusTarget?.fullName} will no longer be able to sign in.`
            : `${statusTarget?.fullName} will regain access to SmartMart.`
        }
        variant={statusTarget?.status === "active" ? "danger" : "primary"}
        confirmLabel={statusTarget?.status === "active" ? "Deactivate" : "Activate"}
        isLoading={setStatus.isPending}
      />
    </div>
  );
}
