import { db, delay } from "./mock/db";
import type { User } from "@/types";

const DEMO_PASSWORD = "password";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export async function login({ email, password }: LoginInput): Promise<AuthSession> {
  await delay(undefined, 600);
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    throw new Error("No account found with that email address.");
  }
  if (user.status === "inactive") {
    throw new Error("This account has been deactivated. Contact your administrator.");
  }
  if (password !== DEMO_PASSWORD) {
    throw new Error("Incorrect password. Please try again.");
  }
  user.lastLogin = new Date().toISOString();
  const token = btoa(`${user.id}:${Date.now()}`);
  return { user, token };
}

export async function fetchCurrentUser(userId: string): Promise<User> {
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Session expired. Please log in again.");
  return delay(user, 150);
}
