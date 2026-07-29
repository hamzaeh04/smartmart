import { db, delay, ConflictError, NotFoundError } from "./mock/db";
import { paginate, sortBy, type PageParams } from "./mock/paginate";
import { generateBarcode, generateQrValue, generateSku } from "@/utils/id";
import { getStockStatus } from "@/utils/stock";
import type { EntityStatus, Paginated, Product, StockStatus } from "@/types";

export interface ProductFilters extends PageParams {
  search?: string;
  categoryId?: string;
  stockStatus?: StockStatus;
  status?: EntityStatus;
  sortKey?: keyof Product;
  sortDirection?: "asc" | "desc";
}

export type ProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "category" | "supplier" | "sku" | "barcode" | "qrCode"
> & {
  sku?: string;
  barcode?: string;
  qrCode?: string;
};

function withDerived(product: Product): Product {
  return product;
}

export async function listProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  let results = [...db.products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q),
    );
  }
  if (filters.categoryId) {
    results = results.filter((p) => p.categoryId === filters.categoryId);
  }
  if (filters.status) {
    results = results.filter((p) => p.status === filters.status);
  }
  if (filters.stockStatus) {
    results = results.filter((p) => getStockStatus(p.currentStock, p.minimumStock) === filters.stockStatus);
  }

  results = sortBy(results, filters.sortKey, filters.sortDirection);

  return delay(paginate(results.map(withDerived), filters));
}

export async function getProduct(id: string): Promise<Product> {
  const product = db.products.find((p) => p.id === id);
  if (!product) throw new NotFoundError(`Product ${id} not found`);
  return delay(product, 250);
}

/** GET /api/products/lookup?code=... — searches QR code, barcode, and SKU. */
export async function lookupProduct(code: string): Promise<Product> {
  const trimmed = code.trim();
  const product = db.products.find(
    (p) => p.qrCode === trimmed || p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase(),
  );
  if (!product) throw new NotFoundError(`No product matches code "${code}"`);
  return delay(product, 350);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const category = db.categories.find((c) => c.id === input.categoryId);
  if (!category) throw new NotFoundError("Category not found");
  const supplier = input.supplierId ? db.suppliers.find((s) => s.id === input.supplierId) : undefined;

  db.productSeq += 1;
  const sku = input.sku?.trim() || generateSku(category.name, db.productSeq);
  const barcode = input.barcode?.trim() || generateBarcode();
  const qrCode = input.qrCode?.trim() || generateQrValue(db.productSeq);

  if (db.products.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
    throw new ConflictError(`SKU "${sku}" is already in use`);
  }
  if (barcode && db.products.some((p) => p.barcode === barcode)) {
    throw new ConflictError(`Barcode "${barcode}" is already in use`);
  }
  if (db.products.some((p) => p.qrCode === qrCode)) {
    throw new ConflictError(`QR code "${qrCode}" is already in use`);
  }

  const now = new Date().toISOString();
  const product: Product = {
    id: `prod_${db.productSeq}`,
    name: input.name,
    image: input.image || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=300&fit=crop",
    sku,
    barcode,
    qrCode,
    categoryId: input.categoryId,
    category: category.name,
    purchasePrice: input.purchasePrice,
    sellingPrice: input.sellingPrice,
    currentStock: input.currentStock,
    minimumStock: input.minimumStock,
    unit: input.unit,
    description: input.description,
    supplierId: input.supplierId,
    supplier: supplier?.name,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  db.products.push(product);
  category.productCount += 1;
  return delay(product, 500);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const product = db.products.find((p) => p.id === id);
  if (!product) throw new NotFoundError(`Product ${id} not found`);

  if (input.sku && db.products.some((p) => p.id !== id && p.sku.toLowerCase() === input.sku!.toLowerCase())) {
    throw new ConflictError(`SKU "${input.sku}" is already in use`);
  }
  if (input.barcode && db.products.some((p) => p.id !== id && p.barcode === input.barcode)) {
    throw new ConflictError(`Barcode "${input.barcode}" is already in use`);
  }

  if (input.categoryId && input.categoryId !== product.categoryId) {
    const oldCategory = db.categories.find((c) => c.id === product.categoryId);
    const newCategory = db.categories.find((c) => c.id === input.categoryId);
    if (!newCategory) throw new NotFoundError("Category not found");
    if (oldCategory) oldCategory.productCount -= 1;
    newCategory.productCount += 1;
    product.category = newCategory.name;
  }

  if (input.supplierId !== undefined) {
    const supplier = db.suppliers.find((s) => s.id === input.supplierId);
    product.supplier = supplier?.name;
  }

  Object.assign(product, input, { updatedAt: new Date().toISOString() });
  return delay(product, 500);
}

export async function deleteProduct(id: string): Promise<void> {
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) throw new NotFoundError(`Product ${id} not found`);
  const [removed] = db.products.splice(index, 1);
  const category = db.categories.find((c) => c.id === removed.categoryId);
  if (category) category.productCount -= 1;
  return delay(undefined, 400);
}
