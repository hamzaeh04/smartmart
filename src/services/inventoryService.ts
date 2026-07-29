import { db, delay, NotFoundError, ValidationError } from "./mock/db";
import { paginate, sortBy, type PageParams } from "./mock/paginate";
import { pushNotification } from "./notificationService";
import { generateId } from "@/utils/id";
import { getStockStatus } from "@/utils/stock";
import type { AdjustmentType, Paginated, Product, StockHistory, StockStatus } from "@/types";

export interface InventoryFilters extends PageParams {
  search?: string;
  categoryId?: string;
  stockStatus?: StockStatus;
  sortKey?: keyof Product;
  sortDirection?: "asc" | "desc";
}

export async function listInventory(filters: InventoryFilters = {}): Promise<Paginated<Product>> {
  let results = [...db.products];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }
  if (filters.categoryId) results = results.filter((p) => p.categoryId === filters.categoryId);
  if (filters.stockStatus) {
    results = results.filter((p) => getStockStatus(p.currentStock, p.minimumStock) === filters.stockStatus);
  }
  results = sortBy(results, filters.sortKey, filters.sortDirection);
  return delay(paginate(results, filters), 350);
}

export interface StockAdjustmentInput {
  productId: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  userId: string;
  userName: string;
}

function recordHistory(entry: Omit<StockHistory, "id">): StockHistory {
  const record: StockHistory = { id: generateId("sh"), ...entry };
  db.stockHistory.unshift(record);
  return record;
}

function checkStockNotifications(product: Product) {
  const status = getStockStatus(product.currentStock, product.minimumStock);
  if (status === "out-of-stock") {
    pushNotification("out-of-stock", "Out of stock", `${product.name} is now out of stock.`, "/inventory");
  } else if (status === "low-stock") {
    pushNotification(
      "low-stock",
      "Low stock alert",
      `${product.name} has only ${product.currentStock} unit(s) left.`,
      "/inventory",
    );
  }
}

export async function adjustStock(input: StockAdjustmentInput): Promise<{ product: Product; history: StockHistory }> {
  const product = db.products.find((p) => p.id === input.productId);
  if (!product) throw new NotFoundError("Product not found");
  if (!input.reason?.trim()) throw new ValidationError("A reason is required for every stock adjustment");
  if (input.quantity <= 0) throw new ValidationError("Quantity must be greater than zero");

  const previousQuantity = product.currentStock;
  const delta = input.type === "add" ? input.quantity : -input.quantity;
  const newQuantity = previousQuantity + delta;

  if (newQuantity < 0) {
    throw new ValidationError("Stock cannot become negative. Reduce the quantity being removed.");
  }

  product.currentStock = newQuantity;
  product.updatedAt = new Date().toISOString();

  const history = recordHistory({
    productId: product.id,
    productName: product.name,
    source: "adjustment",
    type: input.type,
    quantityChanged: input.quantity,
    previousQuantity,
    newQuantity,
    reason: input.reason,
    userId: input.userId,
    userName: input.userName,
    createdAt: new Date().toISOString(),
  });

  pushNotification(
    "inventory-adjusted",
    "Inventory adjusted",
    `${input.type === "add" ? "Added" : "Removed"} ${input.quantity} unit(s) of ${product.name}.`,
    "/inventory/history",
  );
  checkStockNotifications(product);

  return delay({ product, history }, 450);
}

export interface StockHistoryFilters extends PageParams {
  search?: string;
  productId?: string;
  source?: StockHistory["source"];
  type?: AdjustmentType;
  dateFrom?: string;
  dateTo?: string;
}

export async function listStockHistory(filters: StockHistoryFilters = {}): Promise<Paginated<StockHistory>> {
  let results = [...db.stockHistory];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (h) => h.productName.toLowerCase().includes(q) || h.reason.toLowerCase().includes(q),
    );
  }
  if (filters.productId) results = results.filter((h) => h.productId === filters.productId);
  if (filters.source) results = results.filter((h) => h.source === filters.source);
  if (filters.type) results = results.filter((h) => h.type === filters.type);
  if (filters.dateFrom) results = results.filter((h) => h.createdAt >= filters.dateFrom!);
  if (filters.dateTo) results = results.filter((h) => h.createdAt <= filters.dateTo!);
  results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return delay(paginate(results, filters), 350);
}

export function _internalRecordHistory(entry: Omit<StockHistory, "id">) {
  return recordHistory(entry);
}
export function _internalCheckStockNotifications(product: Product) {
  return checkStockNotifications(product);
}
