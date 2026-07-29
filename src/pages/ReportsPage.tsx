import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/feedback/SkeletonLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { useCategories } from "@/features/categories/hooks";
import { useSuppliers } from "@/features/suppliers/hooks";
import {
  useDailySalesReport,
  useInventoryReport,
  useLowStockReport,
  useProductSalesReport,
  usePurchaseReport,
} from "@/features/reports/hooks";
import { exportToCsv } from "@/utils/exportCsv";
import { formatCurrency, formatDate } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import type {
  DailySalesRow,
  InventoryReportRow,
  ProductSalesRow,
  PurchaseReportRow,
} from "@/services/reportService";

const TABS = [
  { value: "daily-sales", label: "Daily Sales" },
  { value: "product-sales", label: "Product Sales" },
  { value: "inventory", label: "Inventory" },
  { value: "low-stock", label: "Low Stock" },
  { value: "purchases", label: "Purchases" },
];

function ReportToolbar({ onPrint, onExport }: { onPrint: () => void; onExport: () => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" leftIcon={<Printer className="size-4" />} onClick={onPrint}>
        Print
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Download className="size-4" />} onClick={onExport}>
        Export
      </Button>
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState("daily-sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Analyze sales, inventory, and purchasing performance.</p>
      </div>

      <Card>
        <Tabs tabs={TABS} value={tab} onChange={setTab} className="px-5 pt-2" />

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3.5">
          {(tab === "daily-sales" || tab === "product-sales" || tab === "purchases") && (
            <>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} containerClassName="w-40" aria-label="From date" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} containerClassName="w-40" aria-label="To date" />
            </>
          )}
          {(tab === "product-sales" || tab === "inventory") && (
            <Select placeholder="All Categories" options={categories.map((c) => ({ value: c.id, label: c.name }))} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} containerClassName="w-48" />
          )}
          {tab === "purchases" && (
            <Select placeholder="All Suppliers" options={suppliers.map((s) => ({ value: s.id, label: s.name }))} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} containerClassName="w-48" />
          )}
          {tab === "product-sales" && (
            <ProductSearch value={search} onChange={setSearch} placeholder="Search product..." className="w-56" />
          )}
        </div>

        <div id="printable-area">
          {tab === "daily-sales" && <DailySalesReport dateFrom={dateFrom} dateTo={dateTo} />}
          {tab === "product-sales" && <ProductSalesReport dateFrom={dateFrom} dateTo={dateTo} categoryId={categoryId} search={search} />}
          {tab === "inventory" && <InventoryReport categoryId={categoryId} />}
          {tab === "low-stock" && <LowStockReport />}
          {tab === "purchases" && <PurchaseReport dateFrom={dateFrom} dateTo={dateTo} supplierId={supplierId} />}
        </div>
      </Card>
    </div>
  );
}

function DailySalesReport({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const { data = [], isLoading } = useDailySalesReport({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
  const columns: Column<DailySalesRow>[] = [
    { key: "date", header: "Date", render: (r) => <span className="font-medium text-slate-800">{formatDate(r.date)}</span> },
    { key: "orders", header: "Orders", render: (r) => <span className="tabular-nums">{r.orders}</span> },
    { key: "totalSales", header: "Total Sales", render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.totalSales)}</span> },
    { key: "totalDiscount", header: "Discounts", render: (r) => <span className="tabular-nums text-slate-500">{formatCurrency(r.totalDiscount)}</span> },
    { key: "totalTax", header: "Tax", render: (r) => <span className="tabular-nums text-slate-500">{formatCurrency(r.totalTax)}</span> },
    { key: "averageOrderValue", header: "Avg. Order Value", render: (r) => <span className="tabular-nums">{formatCurrency(r.averageOrderValue)}</span> },
  ];
  return (
    <ReportBody
      isLoading={isLoading}
      empty={data.length === 0}
      toolbar={<ReportToolbar onPrint={() => window.print()} onExport={() => exportToCsv("daily-sales-report", data)} />}
    >
      <Table columns={columns} data={data} rowKey={(r) => r.date} />
    </ReportBody>
  );
}

function ProductSalesReport({ dateFrom, dateTo, categoryId, search }: { dateFrom: string; dateTo: string; categoryId: string; search: string }) {
  const { data = [], isLoading } = useProductSalesReport({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, categoryId: categoryId || undefined });
  const filtered = search ? data.filter((r) => r.productName.toLowerCase().includes(search.toLowerCase())) : data;
  const columns: Column<ProductSalesRow>[] = [
    { key: "productName", header: "Product", render: (r) => <span className="font-medium text-slate-800">{r.productName}</span> },
    { key: "category", header: "Category", render: (r) => <span className="text-slate-500">{r.category}</span> },
    { key: "quantitySold", header: "Qty Sold", render: (r) => <span className="tabular-nums">{r.quantitySold}</span> },
    { key: "totalRevenue", header: "Total Revenue", render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.totalRevenue)}</span> },
  ];
  return (
    <ReportBody
      isLoading={isLoading}
      empty={filtered.length === 0}
      toolbar={<ReportToolbar onPrint={() => window.print()} onExport={() => exportToCsv("product-sales-report", filtered)} />}
    >
      <Table columns={columns} data={filtered} rowKey={(r) => r.productId} />
    </ReportBody>
  );
}

function InventoryReport({ categoryId }: { categoryId: string }) {
  const { data = [], isLoading } = useInventoryReport(categoryId || undefined);
  const columns: Column<InventoryReportRow>[] = [
    { key: "name", header: "Product", render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: "sku", header: "SKU", render: (r) => <span className="text-slate-500">{r.sku}</span> },
    { key: "category", header: "Category", render: (r) => <span className="text-slate-500">{r.category}</span> },
    { key: "currentStock", header: "Current Stock", render: (r) => <span className="tabular-nums">{r.currentStock} {r.unit}</span> },
    { key: "stockValue", header: "Stock Value", render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.stockValue)}</span> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "in-stock" ? "success" : r.status === "low-stock" ? "warning" : "danger"}>{r.status.replace("-", " ")}</Badge> },
  ];
  return (
    <ReportBody
      isLoading={isLoading}
      empty={data.length === 0}
      toolbar={<ReportToolbar onPrint={() => window.print()} onExport={() => exportToCsv("inventory-report", data)} />}
    >
      <Table columns={columns} data={data} rowKey={(r) => r.id} />
    </ReportBody>
  );
}

function LowStockReport() {
  const { data = [], isLoading } = useLowStockReport();
  const columns: Column<InventoryReportRow>[] = [
    { key: "name", header: "Product", render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: "sku", header: "SKU", render: (r) => <span className="text-slate-500">{r.sku}</span> },
    { key: "category", header: "Category", render: (r) => <span className="text-slate-500">{r.category}</span> },
    { key: "currentStock", header: "Current Stock", render: (r) => <span className="tabular-nums">{r.currentStock} {r.unit}</span> },
    { key: "minimumStock", header: "Minimum Stock", render: (r) => <span className="tabular-nums text-slate-500">{r.minimumStock} {r.unit}</span> },
    { key: "status", header: "Status", render: (r) => <Badge variant={r.status === "low-stock" ? "warning" : "danger"}>{r.status.replace("-", " ")}</Badge> },
  ];
  return (
    <ReportBody
      isLoading={isLoading}
      empty={data.length === 0}
      toolbar={<ReportToolbar onPrint={() => window.print()} onExport={() => exportToCsv("low-stock-report", data)} />}
    >
      <Table columns={columns} data={data} rowKey={(r) => r.id} />
    </ReportBody>
  );
}

function PurchaseReport({ dateFrom, dateTo, supplierId }: { dateFrom: string; dateTo: string; supplierId: string }) {
  const { data = [], isLoading } = usePurchaseReport({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, supplierId: supplierId || undefined });
  const columns: Column<PurchaseReportRow>[] = [
    { key: "purchaseNumber", header: "Purchase #", render: (r) => <span className="font-medium text-slate-800">{r.purchaseNumber}</span> },
    { key: "supplierName", header: "Supplier", render: (r) => <span className="text-slate-500">{r.supplierName}</span> },
    { key: "purchaseDate", header: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.purchaseDate)}</span> },
    { key: "itemCount", header: "Products", render: (r) => <span className="tabular-nums">{r.itemCount}</span> },
    { key: "total", header: "Total", render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.total)}</span> },
    { key: "status", header: "Status", render: (r) => <span className="capitalize text-slate-500">{r.status}</span> },
  ];
  return (
    <ReportBody
      isLoading={isLoading}
      empty={data.length === 0}
      toolbar={<ReportToolbar onPrint={() => window.print()} onExport={() => exportToCsv("purchase-report", data)} />}
    >
      <Table columns={columns} data={data} rowKey={(r) => r.purchaseNumber} />
    </ReportBody>
  );
}

function ReportBody({ isLoading, empty, toolbar, children }: { isLoading: boolean; empty: boolean; toolbar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-end px-5 py-3 print:hidden">{toolbar}</div>
      {isLoading ? <SkeletonTable rows={6} cols={6} /> : empty ? <EmptyState title="No data for this report" description="Try adjusting the filters above." /> : children}
    </div>
  );
}
