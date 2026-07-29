import { db, delay } from "./mock/db";
import { getStockStatus } from "@/utils/stock";
import type { Product, Sale } from "@/types";

export type DateRange = "today" | "7d" | "30d" | "month";

function rangeToDays(range: DateRange): number {
  switch (range) {
    case "today":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "month":
      return new Date().getDate();
  }
}

function withinLastNDays(iso: string, days: number, offsetDays = 0): boolean {
  const time = new Date(iso).getTime();
  const now = Date.now();
  const end = now - offsetDays * 86400000;
  const start = end - days * 86400000;
  return time > start && time <= end;
}

export interface DashboardSummary {
  totalSalesToday: number;
  totalSalesChangePct: number;
  totalProducts: number;
  totalProductsChangePct: number;
  inventoryValue: number;
  inventoryValueChangePct: number;
  lowStockCount: number;
  lowStockChangePct: number;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export async function getSummary(range: DateRange = "today"): Promise<DashboardSummary> {
  const days = rangeToDays(range);
  const currentSales = db.sales.filter((s) => withinLastNDays(s.createdAt, days));
  const previousSales = db.sales.filter((s) => withinLastNDays(s.createdAt, days, days));

  const totalSalesToday = Number(currentSales.reduce((sum, s) => sum + s.total, 0).toFixed(2));
  const previousSalesTotal = previousSales.reduce((sum, s) => sum + s.total, 0);

  const totalProducts = db.products.length;
  const inventoryValue = Number(
    db.products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0).toFixed(2),
  );
  const lowStockCount = db.products.filter(
    (p) => getStockStatus(p.currentStock, p.minimumStock) !== "in-stock",
  ).length;

  return delay(
    {
      totalSalesToday,
      totalSalesChangePct: pctChange(totalSalesToday, previousSalesTotal),
      totalProducts,
      totalProductsChangePct: 0,
      inventoryValue,
      inventoryValueChangePct: 2.4,
      lowStockCount,
      lowStockChangePct: -3.1,
    },
    400,
  );
}

export interface ProfitSummary {
  totalPurchases: number;
  grossSales: number;
  netSales: number;
  costOfGoodsSold: number;
  netProfit: number;
  profitMarginPct: number;
}

export async function getProfitSummary(range: DateRange = "today"): Promise<ProfitSummary> {
  const days = rangeToDays(range);
  const salesInRange = db.sales.filter((s) => withinLastNDays(s.createdAt, days));
  const purchasesInRange = db.purchases.filter(
    (p) => p.status === "completed" && withinLastNDays(p.purchaseDate, days),
  );

  const grossSales = salesInRange.reduce((sum, s) => sum + s.subtotal, 0);
  const totalDiscount = salesInRange.reduce((sum, s) => sum + s.discount, 0);
  const netSales = grossSales - totalDiscount;

  const costOfGoodsSold = salesInRange.reduce(
    (sum, s) =>
      sum +
      s.items.reduce((itemSum, item) => {
        const product = db.products.find((p) => p.id === item.productId);
        return itemSum + (product?.purchasePrice ?? 0) * item.quantity;
      }, 0),
    0,
  );

  const totalPurchases = purchasesInRange.reduce((sum, p) => sum + p.total, 0);
  const netProfit = netSales - costOfGoodsSold;
  const profitMarginPct = netSales > 0 ? (netProfit / netSales) * 100 : 0;

  return delay(
    {
      totalPurchases: Number(totalPurchases.toFixed(2)),
      grossSales: Number(grossSales.toFixed(2)),
      netSales: Number(netSales.toFixed(2)),
      costOfGoodsSold: Number(costOfGoodsSold.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      profitMarginPct: Number(profitMarginPct.toFixed(1)),
    },
    400,
  );
}

export type SalesOverviewPeriod = "daily" | "weekly" | "monthly";

export interface SalesOverviewPoint {
  label: string;
  sales: number;
  orders: number;
}

export async function getSalesOverview(period: SalesOverviewPeriod = "daily"): Promise<SalesOverviewPoint[]> {
  const buckets: Record<string, { sales: number; orders: number; date: Date }> = {};

  const bucketCount = period === "daily" ? 14 : period === "weekly" ? 8 : 6;

  for (let i = bucketCount - 1; i >= 0; i -= 1) {
    let label: string;
    let date: Date;
    if (period === "daily") {
      date = new Date(Date.now() - i * 86400000);
      label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "weekly") {
      date = new Date(Date.now() - i * 7 * 86400000);
      label = `Wk ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else {
      date = new Date(Date.now() - i * 30 * 86400000);
      label = date.toLocaleDateString("en-US", { month: "short" });
    }
    buckets[label] = { sales: 0, orders: 0, date };
  }

  const bucketLabels = Object.keys(buckets);
  const spanDays = period === "daily" ? 1 : period === "weekly" ? 7 : 30;

  db.sales.forEach((sale) => {
    const saleTime = new Date(sale.createdAt).getTime();
    for (const label of bucketLabels) {
      const bucketTime = buckets[label].date.getTime();
      if (saleTime <= bucketTime && saleTime > bucketTime - spanDays * 86400000) {
        buckets[label].sales += sale.total;
        buckets[label].orders += 1;
        break;
      }
    }
  });

  return delay(
    bucketLabels.map((label) => ({
      label,
      sales: Number(buckets[label].sales.toFixed(2)),
      orders: buckets[label].orders,
    })),
    350,
  );
}

export interface TopSellingProduct {
  product: Product;
  quantitySold: number;
  totalSales: number;
}

export async function getTopSellingProducts(limit = 5): Promise<TopSellingProduct[]> {
  const totals = new Map<string, { quantity: number; sales: number }>();
  db.sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const entry = totals.get(item.productId) ?? { quantity: 0, sales: 0 };
      entry.quantity += item.quantity;
      entry.sales += item.lineTotal;
      totals.set(item.productId, entry);
    });
  });

  const results = Array.from(totals.entries())
    .map(([productId, entry]) => {
      const product = db.products.find((p) => p.id === productId);
      if (!product) return null;
      return { product, quantitySold: entry.quantity, totalSales: Number(entry.sales.toFixed(2)) };
    })
    .filter((x): x is TopSellingProduct => x !== null)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);

  return delay(results, 350);
}

export async function getLowStockProducts(limit = 5): Promise<Product[]> {
  const results = db.products
    .filter((p) => getStockStatus(p.currentStock, p.minimumStock) !== "in-stock")
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, limit);
  return delay(results, 300);
}

export async function getRecentSales(limit = 6): Promise<Sale[]> {
  const results = [...db.sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  return delay(results, 300);
}
