import { db, delay, ConflictError, NotFoundError, ValidationError } from "./mock/db";
import { generateId } from "@/utils/id";
import type { EntityStatus, Role, User } from "@/types";

export interface UserInput {
  fullName: string;
  email: string;
  role: Role;
  status: EntityStatus;
  password?: string;
}

export async function listUsers(): Promise<User[]> {
  return delay([...db.users].sort((a, b) => a.fullName.localeCompare(b.fullName)), 300);
}

export async function getUser(id: string): Promise<User> {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new NotFoundError(`User ${id} not found`);
  return delay(user, 200);
}

export async function createUser(input: UserInput): Promise<User> {
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ConflictError(`A user with email "${input.email}" already exists`);
  }
  const user: User = {
    id: generateId("user"),
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  return delay(user, 400);
}

export async function updateUser(
  id: string,
  input: Partial<UserInput>,
  actingUserId: string,
): Promise<User> {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new NotFoundError(`User ${id} not found`);

  if (id === actingUserId && input.status === "inactive") {
    throw new ValidationError("You cannot deactivate your own account");
  }
  if (id === actingUserId && input.role && input.role !== "admin" && user.role === "admin") {
    throw new ValidationError("You cannot remove your own admin access");
  }
  if (
    input.email &&
    db.users.some((u) => u.id !== id && u.email.toLowerCase() === input.email!.toLowerCase())
  ) {
    throw new ConflictError(`A user with email "${input.email}" already exists`);
  }

  Object.assign(user, input);
  return delay(user, 400);
}

export async function setUserStatus(
  id: string,
  status: EntityStatus,
  actingUserId: string,
): Promise<User> {
  return updateUser(id, { status }, actingUserId);
}
