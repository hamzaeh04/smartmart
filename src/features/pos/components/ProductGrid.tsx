import { useState } from "react";
import type { FormEvent } from "react";
import { Barcode, QrCode, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonCards } from "@/components/feedback/SkeletonLoader";
import { useCategories } from "@/features/categories/hooks";
import { useProducts } from "@/features/products/hooks";
import { useProductLookup } from "@/features/products/hooks";
import { useCartStore } from "@/store/cartStore";
import { useScannerStore } from "@/store/scannerStore";
import { toast } from "@/store/toastStore";
import { cn } from "@/utils/cn";

export function ProductGrid() {
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useProducts({
    search,
    categoryId: categoryId || undefined,
    status: "active",
    pageSize: 60,
    sortKey: "name",
    sortDirection: "asc",
  });
  const lookup = useProductLookup();
  const addItem = useCartStore((s) => s.addItem);
  const openScanner = useScannerStore((s) => s.open);

  function handleBarcodeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    lookup.mutate(code, {
      onSuccess: (product) => {
        if (product.currentStock <= 0) {
          toast({ variant: "warning", title: "Out of stock", description: `${product.name} has no available stock.` });
        } else {
          addItem(product);
          toast({ variant: "success", title: "Added to cart", description: product.name });
        }
        setBarcode("");
      },
      onError: () => {
        toast({ variant: "error", title: "Product not found", description: `No product matches code "${code}".` });
      },
    });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="size-4" />}
          placeholder="Search products..."
          aria-label="Search products"
        />
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            leftIcon={<Barcode className="size-4" />}
            placeholder="Scan or enter barcode..."
            aria-label="Barcode input"
            containerClassName="flex-1"
          />
          <Button type="button" variant="outline" size="icon" aria-label="Scan product" onClick={() => openScanner("pos")}>
            <QrCode className="size-4" />
          </Button>
        </form>
      </div>

      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryId("")}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            categoryId === "" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50",
          )}
        >
          All
        </button>
        {categories.filter((c) => c.status === "active").map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              categoryId === cat.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <SkeletonCards count={12} />
        ) : !data?.items.length ? (
          <EmptyState title="No products found" description="Try a different search term or category." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => addItem(product)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
