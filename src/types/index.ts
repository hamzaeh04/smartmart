// ---------------------------------------------------------------------------
// SmartMart domain types
// ---------------------------------------------------------------------------

export type Role = "admin" | "manager" | "cashier";

export type EntityStatus = "active" | "inactive";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: EntityStatus;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: EntityStatus;
  productCount: number;
  createdAt: string;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type Unit = "pc" | "kg" | "g" | "l" | "ml" | "box" | "pack";

export interface Product {
  id: string;
  name: string;
  image: string;
  sku: string;
  barcode: string;
  qrCode: string;
  categoryId: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  unit: Unit;
  description?: string;
  supplierId?: string;
  supplier?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: EntityStatus;
  totalPurchases: number;
  purchaseCount: number;
  createdAt: string;
}

export type AdjustmentType = "add" | "remove";

export interface StockAdjustment {
  id: string;
  productId: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  previousQuantity: number;
  newQuantity: number;
  userId: string;
  createdAt: string;
}

export type StockHistorySource = "purchase" | "sale" | "adjustment";

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  source: StockHistorySource;
  type: AdjustmentType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  userId: string;
  userName: string;
  referenceId?: string;
  createdAt: string;
}

export type PurchaseStatus = "draft" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "partial";

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  availableStock: number;
  quantity: number;
  purchasePrice: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  paymentStatus: PaymentStatus;
  status: PurchaseStatus;
  notes?: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "cash" | "card" | "online";
export type SaleStatus = "completed" | "refunded" | "cancelled";

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Payment {
  method: PaymentMethod;
  amountReceived?: number;
  change?: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: Payment;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeLogo?: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  currency: string;
  taxPercentage: number;
  receiptFooter: string;
  lowStockDefaultLevel: number;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

export type NotificationType =
  | "low-stock"
  | "out-of-stock"
  | "purchase-completed"
  | "sale-completed"
  | "inventory-adjusted";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  status: number;
  message: string;
}
