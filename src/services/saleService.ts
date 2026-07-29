import { db, delay, NotFoundError, ValidationError } from "./mock/db";
import { paginate, type PageParams } from "./mock/paginate";
import { _internalCheckStockNotifications, _internalRecordHistory } from "./inventoryService";
import { pushNotification } from "./notificationService";
import { generateInvoiceNumber } from "@/utils/id";
import type { PaymentMethod, Paginated, Sale } from "@/types";

export interface SaleFilters extends PageParams {
  search?: string;
  cashierId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export async function listSales(filters: SaleFilters = {}): Promise<Paginated<Sale>> {
  let results = [...db.sales];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (s) => s.invoiceNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q),
    );
  }
  if (filters.cashierId) results = results.filter((s) => s.cashierId === filters.cashierId);
  if (filters.paymentMethod) results = results.filter((s) => s.payment.method === filters.paymentMethod);
  if (filters.dateFrom) results = results.filter((s) => s.createdAt >= filters.dateFrom!);
  if (filters.dateTo) results = results.filter((s) => s.createdAt <= filters.dateTo!);
  results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return delay(paginate(results, filters), 350);
}

export async function getSale(id: string): Promise<Sale> {
  const sale = db.sales.find((s) => s.id === id);
  if (!sale) throw new NotFoundError(`Sale ${id} not found`);
  return delay(sale, 200);
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CheckoutInput {
  customerName: string;
  items: CartLine[];
  discount: number;
  taxPercentage: number;
  payment: {
    method: PaymentMethod;
    amountReceived?: number;
  };
  clientRequestId: string;
}

const processedRequestIds = new Set<string>();

export async function checkout(
  input: CheckoutInput,
  actor: { userId: string; userName: string },
): Promise<Sale> {
  // Idempotency guard: repeated "Complete Sale" clicks with the same
  // client-generated request id return the original sale instead of
  // creating a duplicate.
  if (processedRequestIds.has(input.clientRequestId)) {
    const existing = db.sales.find((s) => s.id === `sale_req_${input.clientRequestId}`);
    if (existing) return delay(existing, 100);
  }

  if (input.items.length === 0) throw new ValidationError("Cart is empty");

  const items: Sale["items"] = input.items.map((line, index) => {
    const product = db.products.find((p) => p.id === line.productId);
    if (!product) throw new NotFoundError(`Product ${line.productId} not found`);
    if (product.currentStock < line.quantity) {
      throw new ValidationError(
        `Only ${product.currentStock} unit(s) of "${product.name}" available — cannot sell ${line.quantity}.`,
      );
    }
    return {
      id: `si_${Date.now()}_${index}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      quantity: line.quantity,
      unitPrice: product.sellingPrice,
      lineTotal: Number((product.sellingPrice * line.quantity).toFixed(2)),
    };
  });

  const subtotal = Number(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  const taxable = subtotal - input.discount;
  const tax = Number(((taxable * input.taxPercentage) / 100).toFixed(2));
  const total = Number((taxable + tax).toFixed(2));

  if (input.payment.method === "cash" && (input.payment.amountReceived ?? 0) < total) {
    throw new ValidationError("Amount received is less than the total due");
  }

  db.invoiceSeq += 1;
  const sale: Sale = {
    id: `sale_req_${input.clientRequestId}`,
    invoiceNumber: generateInvoiceNumber(db.invoiceSeq),
    customerName: input.customerName.trim() || "Walk-in Customer",
    cashierId: actor.userId,
    cashierName: actor.userName,
    items,
    subtotal,
    discount: input.discount,
    tax,
    total,
    payment: {
      method: input.payment.method,
      amountReceived: input.payment.amountReceived,
      change:
        input.payment.method === "cash" && input.payment.amountReceived !== undefined
          ? Number((input.payment.amountReceived - total).toFixed(2))
          : undefined,
    },
    paymentStatus: "paid",
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  // Reduce inventory + record stock history for each line.
  items.forEach((item) => {
    const product = db.products.find((p) => p.id === item.productId)!;
    const previousQuantity = product.currentStock;
    product.currentStock -= item.quantity;
    product.updatedAt = new Date().toISOString();
    _internalRecordHistory({
      productId: product.id,
      productName: product.name,
      source: "sale",
      type: "remove",
      quantityChanged: item.quantity,
      previousQuantity,
      newQuantity: product.currentStock,
      reason: `Sale ${sale.invoiceNumber}`,
      userId: actor.userId,
      userName: actor.userName,
      referenceId: sale.id,
      createdAt: new Date().toISOString(),
    });
    _internalCheckStockNotifications(product);
  });

  db.sales.unshift(sale);
  processedRequestIds.add(input.clientRequestId);

  pushNotification(
    "sale-completed",
    "Sale completed",
    `Invoice ${sale.invoiceNumber} for ${sale.total.toFixed(2)} completed.`,
    "/sales",
  );

  return delay(sale, 600);
}
