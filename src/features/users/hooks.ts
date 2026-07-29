import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, listUsers, setUserStatus, updateUser, type UserInput } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toastStore";
import type { EntityStatus } from "@/types";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: listUsers });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => createUser(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ variant: "success", title: "User created", description: `${user.fullName} can now sign in.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to create user", description: err.message }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UserInput> }) =>
      updateUser(id, input, currentUser?.id ?? ""),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ variant: "success", title: "User updated", description: `${user.fullName} has been saved.` });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to update user", description: err.message }),
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EntityStatus }) =>
      setUserStatus(id, status, currentUser?.id ?? ""),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        variant: "success",
        title: user.status === "active" ? "User activated" : "User deactivated",
        description: user.fullName,
      });
    },
    onError: (err: Error) => toast({ variant: "error", title: "Unable to update status", description: err.message }),
  });
}
