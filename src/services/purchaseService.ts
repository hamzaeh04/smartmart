import { db, delay, NotFoundError, ValidationError } from "./mock/db";
import { paginate, type PageParams } from "./mock/paginate";
import { _internalCheckStockNotifications, _internalRecordHistory } from "./inventoryService";
import { pushNotification } from "./notificationService";
import { generatePurchaseNumber } from "@/utils/id";
import type { Paginated, PaymentStatus, Purchase, PurchaseItem, PurchaseStatus } from "@/types";

export interface PurchaseFilters extends PageParams {
  search?: string;
  supplierId?: string;
  status?: PurchaseStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export async function listPurchases(filters: PurchaseFilters = {}): Promise<Paginated<Purchase>> {
  let results = [...db.purchases];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) => p.purchaseNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q),
    );
  }
  if (filters.supplierId) results = results.filter((p) => p.supplierId === filters.supplierId);
  if (filters.status) results = results.filter((p) => p.status === filters.status);
  if (filters.paymentStatus) results = results.filter((p) => p.paymentStatus === filters.paymentStatus);
  if (filters.dateFrom) results = results.filter((p) => p.purchaseDate >= filters.dateFrom!);
  if (filters.dateTo) results = results.filter((p) => p.purchaseDate <= filters.dateTo!);
  results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return delay(paginate(results, filters), 350);
}

export async function getPurchase(id: string): Promise<Purchase> {
  const purchase = db.purchases.find((p) => p.id === id);
  if (!purchase) throw new NotFoundError(`Purchase ${id} not found`);
  return delay(purchase, 200);
}

export interface PurchaseItemInput {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface PurchaseInput {
  supplierId: string;
  purchaseDate: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  discount: number;
  items: PurchaseItemInput[];
  status: Extract<PurchaseStatus, "draft" | "completed">;
}

function buildItems(items: PurchaseItemInput[]): PurchaseItem[] {
  return items.map((item, index) => {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) throw new NotFoundError(`Product ${item.productId} not found`);
    return {
      id: `pi_${Date.now()}_${index}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      availableStock: product.currentStock,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      lineTotal: Number((item.quantity * item.purchasePrice).toFixed(2)),
    };
  });
}

function applyInventoryIncrease(purchase: Purchase, userId: string, userName: string) {
  purchase.items.forEach((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) return;
    const previousQuantity = product.currentStock;
    product.currentStock += item.quantity;
    product.updatedAt = new Date().toISOString();
    _internalRecordHistory({
      productId: product.id,
      productName: product.name,
      source: "purchase",
      type: "add",
      quantityChanged: item.quantity,
      previousQuantity,
      newQuantity: product.currentStock,
      reason: `Purchase ${purchase.purchaseNumber} received from ${purchase.supplierName}`,
      userId,
      userName,
      referenceId: purchase.id,
      createdAt: new Date().toISOString(),
    });
    _internalCheckStockNotifications(product);
  });
}

export async function createPurchase(
  input: PurchaseInput,
  actor: { userId: string; userName: string },
): Promise<Purchase> {
  if (input.items.length === 0) throw new ValidationError("A purchase must include at least one product");
  const supplier = db.suppliers.find((s) => s.id === input.supplierId);
  if (!supplier) throw new NotFoundError("Supplier not found");

  const items = buildItems(input.items);
  const subtotal = Number(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  const total = Number((subtotal - input.discount).toFixed(2));

  db.purchaseSeq += 1;
  const now = new Date().toISOString();
  const purchase: Purchase = {
    id: `pur_${db.purchaseSeq}`,
    purchaseNumber: generatePurchaseNumber(db.purchaseSeq),
    supplierId: supplier.id,
    supplierName: supplier.name,
    purchaseDate: input.purchaseDate,
    paymentStatus: input.paymentStatus,
    status: input.status,
    notes: input.notes,
    items,
    subtotal,
    discount: input.discount,
    total,
    createdAt: now,
    updatedAt: now,
  };

  db.purchases.unshift(purchase);

  if (purchase.status === "completed") {
    applyInventoryIncrease(purchase, actor.userId, actor.userName);
    supplier.purchaseCount += 1;
    supplier.totalPurchases = Number((supplier.totalPurchases + purchase.total).toFixed(2));
    pushNotification(
      "purchase-completed",
      "Purchase completed",
      `Purchase ${purchase.purchaseNumber} from ${supplier.name} marked complete.`,
      "/purchases",
    );
  }

  return delay(purchase, 500);
}

export async function completePurchase(
  id: string,
  actor: { userId: string; userName: string },
): Promise<Purchase> {
  const purchase = db.purchases.find((p) => p.id === id);
  if (!purchase) throw new NotFoundError(`Purchase ${id} not found`);
  if (purchase.status !== "draft") throw new ValidationError("Only draft purchases can be completed");

  purchase.status = "completed";
  purchase.updatedAt = new Date().toISOString();
  applyInventoryIncrease(purchase, actor.userId, actor.userName);

  const supplier = db.suppliers.find((s) => s.id === purchase.supplierId);
  if (supplier) {
    supplier.purchaseCount += 1;
    supplier.totalPurchases = Number((supplier.totalPurchases + purchase.total).toFixed(2));
  }
  pushNotification(
    "purchase-completed",
    "Purchase completed",
    `Purchase ${purchase.purchaseNumber} from ${purchase.supplierName} marked complete.`,
    "/purchases",
  );

  return delay(purchase, 400);
}

export async function cancelPurchase(id: string): Promise<Purchase> {
  const purchase = db.purchases.find((p) => p.id === id);
  if (!purchase) throw new NotFoundError(`Purchase ${id} not found`);
  if (purchase.status === "completed") {
    throw new ValidationError("Completed purchases cannot be cancelled");
  }
  purchase.status = "cancelled";
  purchase.updatedAt = new Date().toISOString();
  return delay(purchase, 350);
}
