import { db, delay } from "./mock/db";
import type { StoreSettings } from "@/types";

export async function getSettings(): Promise<StoreSettings> {
  return delay(db.settings, 250);
}

export async function updateSettings(input: Partial<StoreSettings>): Promise<StoreSettings> {
  db.settings = { ...db.settings, ...input };
  return delay(db.settings, 450);
}
