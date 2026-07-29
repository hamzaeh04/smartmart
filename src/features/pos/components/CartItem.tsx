import { Minus, Plus, X } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { useCartStore } from "@/store/cartStore";
import type { CartItem as CartItemType } from "@/store/cartStore";

export function CartItem({ item }: { item: CartItemType }) {
  const incrementQty = useCartStore((s) => s.incrementQty);
  const decrementQty = useCartStore((s) => s.decrementQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <img src={item.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
        <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} each</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-1 py-1">
        <button
          onClick={() => decrementQty(item.productId)}
          aria-label="Decrease quantity"
          className="flex size-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
        <button
          onClick={() => incrementQty(item.productId)}
          disabled={item.quantity >= item.availableStock}
          aria-label="Increase quantity"
          className="flex size-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <p className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
        {formatCurrency(item.unitPrice * item.quantity)}
      </p>
      <button
        onClick={() => removeItem(item.productId)}
        aria-label="Remove item"
        className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-danger-50 hover:text-danger-500"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
