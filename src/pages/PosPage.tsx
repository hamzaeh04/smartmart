import { ProductGrid } from "@/features/pos/components/ProductGrid";
import { POSCart } from "@/features/pos/components/POSCart";

export default function PosPage() {
  return (
    <div className="grid h-[calc(100vh-6.5rem)] grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      <div className="min-h-0 rounded-card border border-slate-200 bg-white p-4 shadow-sm">
        <ProductGrid />
      </div>
      <div className="min-h-0 rounded-card border border-slate-200 bg-white shadow-sm">
        <POSCart />
      </div>
    </div>
  );
}
