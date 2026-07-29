import { db, delay } from "./mock/db";
import { getStockStatus } from "@/utils/stock";
import type { Product } from "@/types";

export interface ReportDateRange {
  dateFrom?: string;
  dateTo?: string;
}

function inRange(iso: string, { dateFrom, dateTo }: ReportDateRange): boolean {
  if (dateFrom && iso < dateFrom) return false;
  if (dateTo && iso > dateTo) return false;
  return true;
}

export interface DailySalesRow {
  date: string;
  orders: number;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  averageOrderValue: number;
}

export async function getDailySalesReport(range: ReportDateRange = {}): Promise<DailySalesRow[]> {
  const groups = new Map<string, { orders: number; sales: number; tax: number; discount: number }>();
  db.sales
    .filter((s) => inRange(s.createdAt, range))
    .forEach((sale) => {
      const date = sale.createdAt.slice(0, 10);
      const entry = groups.get(date) ?? { orders: 0, sales: 0, tax: 0, discount: 0 };
      entry.orders += 1;
      entry.sales += sale.total;
      entry.tax += sale.tax;
      entry.discount += sale.discount;
      groups.set(date, entry);
    });

  const rows = Array.from(groups.entries())
    .map(([date, entry]) => ({
      date,
      orders: entry.orders,
      totalSales: Number(entry.sales.toFixed(2)),
      totalTax: Number(entry.tax.toFixed(2)),
      totalDiscount: Number(entry.discount.toFixed(2)),
      averageOrderValue: Number((entry.sales / entry.orders).toFixed(2)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return delay(rows, 400);
}

export interface ProductSalesRow {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
}

export async function getProductSalesReport(
  range: ReportDateRange & { categoryId?: string; productId?: string } = {},
): Promise<ProductSalesRow[]> {
  const totals = new Map<string, { quantity: number; revenue: number }>();
  db.sales
    .filter((s) => inRange(s.createdAt, range))
    .forEach((sale) => {
      sale.items.forEach((item) => {
        const entry = totals.get(item.productId) ?? { quantity: 0, revenue: 0 };
        entry.quantity += item.quantity;
        entry.revenue += item.lineTotal;
        totals.set(item.productId, entry);
      });
    });

  let rows: ProductSalesRow[] = Array.from(totals.entries())
    .map(([productId, entry]) => {
      const product = db.products.find((p) => p.id === productId);
      if (!product) return null;
      return {
        productId,
        productName: product.name,
        category: product.category,
        quantitySold: entry.quantity,
        totalRevenue: Number(entry.revenue.toFixed(2)),
      };
    })
    .filter((r): r is ProductSalesRow => r !== null);

  if (range.categoryId) {
    const category = db.categories.find((c) => c.id === range.categoryId);
    rows = rows.filter((r) => r.category === category?.name);
  }
  if (range.productId) rows = rows.filter((r) => r.productId === range.productId);

  rows.sort((a, b) => b.totalRevenue - a.totalRevenue);
  return delay(rows, 400);
}

export interface InventoryReportRow extends Pick<Product, "id" | "name" | "sku" | "category" | "currentStock" | "minimumStock" | "unit"> {
  stockValue: number;
  status: ReturnType<typeof getStockStatus>;
}

export async function getInventoryReport(categoryId?: string): Promise<InventoryReportRow[]> {
  let products = [...db.products];
  if (categoryId) products = products.filter((p) => p.categoryId === categoryId);
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    currentStock: p.currentStock,
    minimumStock: p.minimumStock,
    unit: p.unit,
    stockValue: Number((p.currentStock * p.purchasePrice).toFixed(2)),
    status: getStockStatus(p.currentStock, p.minimumStock),
  }));
  return delay(rows, 400);
}

export async function getLowStockReport(): Promise<InventoryReportRow[]> {
  const rows = await getInventoryReport();
  return rows.filter((r) => r.status !== "in-stock");
}

export interface PurchaseReportRow {
  purchaseNumber: string;
  supplierName: string;
  purchaseDate: string;
  itemCount: number;
  total: number;
  status: string;
  paymentStatus: string;
}

export async function getPurchaseReport(
  range: ReportDateRange & { supplierId?: string } = {},
): Promise<PurchaseReportRow[]> {
  let purchases = db.purchases.filter((p) => inRange(p.purchaseDate, range));
  if (range.supplierId) purchases = purchases.filter((p) => p.supplierId === range.supplierId);
  const rows = purchases
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
    .map((p) => ({
      purchaseNumber: p.purchaseNumber,
      supplierName: p.supplierName,
      purchaseDate: p.purchaseDate,
      itemCount: p.items.length,
      total: p.total,
      status: p.status,
      paymentStatus: p.paymentStatus,
    }));
  return delay(rows, 400);
}
