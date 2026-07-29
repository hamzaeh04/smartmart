import {
  seedCategories,
  seedNotifications,
  seedProducts,
  seedPurchases,
  seedSales,
  seedSettings,
  seedStockHistory,
  seedSuppliers,
  seedUsers,
} from "./seed";
import type {
  AppNotification,
  Category,
  Product,
  Purchase,
  Sale,
  StockHistory,
  StoreSettings,
  Supplier,
  User,
} from "@/types";

/**
 * A single in-memory "database" singleton shared by all mock services.
 * Mutating arrays here is how the mock backend persists state across
 * navigations for the lifetime of the browser tab.
 */
class MockDb {
  users: User[] = clone(seedUsers);
  categories: Category[] = clone(seedCategories);
  products: Product[] = clone(seedProducts);
  suppliers: Supplier[] = clone(seedSuppliers);
  purchases: Purchase[] = clone(seedPurchases);
  sales: Sale[] = clone(seedSales);
  stockHistory: StockHistory[] = clone(seedStockHistory);
  notifications: AppNotification[] = clone(seedNotifications);
  settings: StoreSettings = clone(seedSettings);

  productSeq = 2000;
  invoiceSeq = seedSales.length;
  purchaseSeq = seedPurchases.length;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const db = new MockDb();

/** Simulated network latency for all mock service calls. */
export function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  status = 409;
  constructor(message = "Conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

export class ValidationError extends Error {
  status = 422;
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}
