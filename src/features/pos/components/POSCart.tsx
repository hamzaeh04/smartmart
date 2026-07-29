import { useMemo, useRef, useState } from "react";
import { CreditCard, Landmark, ShoppingCart, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CartItem } from "./CartItem";
import { ReceiptModal } from "./ReceiptModal";
import { useCartStore } from "@/store/cartStore";
import { useCheckout, useStoreSettings } from "../hooks";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { PaymentMethod, Sale } from "@/types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "online", label: "Online", icon: Landmark },
];

function generateRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function POSCart() {
  const items = useCartStore((s) => s.items);
  const customerName = useCartStore((s) => s.customerName);
  const setCustomerName = useCartStore((s) => s.setCustomerName);
  const discount = useCartStore((s) => s.discount);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: settings } = useStoreSettings();
  const checkout = useCheckout();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const requestId = useRef(generateRequestId());

  const taxPercentage = settings?.taxPercentage ?? 0;
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Number(((taxable * taxPercentage) / 100).toFixed(2));
  const total = Number((taxable + tax).toFixed(2));
  const received = Number(amountReceived) || 0;
  const change = paymentMethod === "cash" ? Math.max(0, received - total) : 0;

  const canCompleteSale =
    items.length > 0 && !checkout.isPending && (paymentMethod !== "cash" || received >= total);

  function handleCompleteSale() {
    if (!canCompleteSale) return;
    checkout.mutate(
      {
        customerName,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        discount,
        taxPercentage,
        payment: { method: paymentMethod, amountReceived: paymentMethod === "cash" ? received : undefined },
        clientRequestId: requestId.current,
      },
      {
        onSuccess: (sale) => {
          setCompletedSale(sale);
          clearCart();
          setAmountReceived("");
          setPaymentMethod("cash");
          requestId.current = generateRequestId();
        },
      },
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ShoppingCart className="size-4" /> Cart ({items.length})
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-danger-600 hover:text-danger-700"
          >
            <Trash2 className="size-3.5" /> Clear Cart
          </button>
        )}
      </div>

      <div className="scrollbar-thin flex-1 divide-y divide-slate-100 overflow-y-auto px-4">
        {items.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="size-6" />} title="Cart is empty" description="Tap a product to add it to the cart." />
        ) : (
          items.map((item) => <CartItem key={item.productId} item={item} />)
        )}
      </div>

      <div className="space-y-3 border-t border-slate-100 px-4 py-3.5">
        <Input
          label="Customer"
          placeholder="Walk-in Customer"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums font-medium text-slate-800">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Discount</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={discount || ""}
              onChange={(e) => setDiscount(e.target.valueAsNumber || 0)}
              placeholder="0.00"
              className="h-7 w-20 rounded-md border border-slate-200 px-2 text-right text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tax ({taxPercentage}%)</span>
            <span className="tabular-nums font-medium text-slate-800">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-1.5 text-base">
            <span className="font-semibold text-slate-900">Grand Total</span>
            <span className="font-bold tabular-nums text-brand-700">{formatCurrency(total)}</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPaymentMethod(m.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                  paymentMethod === m.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50",
                )}
              >
                <m.icon className="size-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "cash" && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount Received"
              type="number"
              min={0}
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Change</label>
              <p className={cn("flex h-10 items-center text-sm font-semibold tabular-nums", change > 0 ? "text-brand-700" : "text-slate-400")}>
                {formatCurrency(change)}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmClearOpen(true)} disabled={items.length === 0}>
            Cancel Sale
          </Button>
          <Button className="flex-1" onClick={handleCompleteSale} disabled={!canCompleteSale} isLoading={checkout.isPending}>
            Complete Sale
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          clearCart();
          setConfirmClearOpen(false);
        }}
        title="Clear the cart?"
        description="All items in the current sale will be removed."
        confirmLabel="Clear Cart"
      />

      <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
    </div>
  );
}
