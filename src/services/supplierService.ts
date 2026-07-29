import { db, delay, NotFoundError } from "./mock/db";
import { generateId } from "@/utils/id";
import type { EntityStatus, Purchase, Supplier } from "@/types";

export interface SupplierInput {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: EntityStatus;
}

export async function listSuppliers(search?: string): Promise<Supplier[]> {
  let results = [...db.suppliers];
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (s) => s.name.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q),
    );
  }
  return delay(results, 300);
}

export async function getSupplier(id: string): Promise<Supplier> {
  const supplier = db.suppliers.find((s) => s.id === id);
  if (!supplier) throw new NotFoundError(`Supplier ${id} not found`);
  return delay(supplier, 200);
}

export async function getSupplierPurchases(id: string): Promise<Purchase[]> {
  return delay(
    db.purchases.filter((p) => p.supplierId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    300,
  );
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const supplier: Supplier = {
    id: generateId("sup"),
    ...input,
    totalPurchases: 0,
    purchaseCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.suppliers.push(supplier);
  return delay(supplier, 400);
}

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<Supplier> {
  const supplier = db.suppliers.find((s) => s.id === id);
  if (!supplier) throw new NotFoundError(`Supplier ${id} not found`);
  Object.assign(supplier, input);
  return delay(supplier, 400);
}

export async function deleteSupplier(id: string): Promise<void> {
  db.suppliers = db.suppliers.filter((s) => s.id !== id);
  return delay(undefined, 350);
}
