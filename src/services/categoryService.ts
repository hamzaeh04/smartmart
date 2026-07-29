import { db, delay, ConflictError, NotFoundError } from "./mock/db";
import { generateId } from "@/utils/id";
import type { Category, EntityStatus } from "@/types";

export interface CategoryInput {
  name: string;
  description?: string;
  status: EntityStatus;
}

export async function listCategories(search?: string): Promise<Category[]> {
  let results = [...db.categories];
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((c) => c.name.toLowerCase().includes(q));
  }
  return delay(results, 300);
}

export async function getCategory(id: string): Promise<Category> {
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw new NotFoundError(`Category ${id} not found`);
  return delay(category, 200);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  if (db.categories.some((c) => c.name.toLowerCase() === input.name.toLowerCase())) {
    throw new ConflictError(`Category "${input.name}" already exists`);
  }
  const category: Category = {
    id: generateId("cat"),
    name: input.name,
    description: input.description,
    status: input.status,
    productCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.categories.push(category);
  return delay(category, 400);
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw new NotFoundError(`Category ${id} not found`);
  if (
    input.name &&
    db.categories.some((c) => c.id !== id && c.name.toLowerCase() === input.name!.toLowerCase())
  ) {
    throw new ConflictError(`Category "${input.name}" already exists`);
  }
  Object.assign(category, input);
  if (input.name) {
    db.products.filter((p) => p.categoryId === id).forEach((p) => (p.category = input.name!));
  }
  return delay(category, 400);
}

export async function deleteCategory(id: string): Promise<void> {
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw new NotFoundError(`Category ${id} not found`);
  if (category.productCount > 0) {
    throw new ConflictError(
      `"${category.name}" cannot be deleted because it is assigned to ${category.productCount} product(s). Reassign or remove those products first.`,
    );
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  return delay(undefined, 350);
}
