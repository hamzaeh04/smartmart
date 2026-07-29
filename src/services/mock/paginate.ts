import type { Paginated } from "@/types";

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export function paginate<T>(items: T[], { page = 1, pageSize = 10 }: PageParams): Paginated<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}

export function sortBy<T>(items: T[], key: keyof T | undefined, direction: "asc" | "desc" = "asc"): T[] {
  if (!key) return items;
  const sorted = [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv));
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}
