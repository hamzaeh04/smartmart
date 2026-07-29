import { Store } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStoreSettings } from "../hooks";
import { formatCurrency, formatDateTime } from "@/utils/format";
import type { Sale } from "@/types";

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  const { data: settings } = useStoreSettings();

  return (
    <Modal
      isOpen={!!sale}
      onClose={onClose}
      title="Sale Completed"
      size="sm"
      footer={<Button onClick={() => window.print()}>Print Receipt</Button>}
    >
      {sale && (
        <div id="printable-area" className="mx-auto max-w-xs font-mono text-xs text-slate-700">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <Store className="size-4 text-brand-600" />
              <span className="font-sans text-sm font-bold text-slate-900">{settings?.storeName ?? "SmartMart"}</span>
            </div>
            <p>{settings?.storeAddress}</p>
            <p>{settings?.storePhone}</p>
          </div>

          <div className="my-3 border-t border-dashed border-slate-300" />

          <div className="space-y-0.5">
            <p>Invoice: {sale.invoiceNumber}</p>
            <p>Date: {formatDateTime(sale.createdAt)}</p>
            <p>Cashier: {sale.cashierName}</p>
            <p>Customer: {sale.customerName}</p>
          </div>

          <div className="my-3 border-t border-dashed border-slate-300" />

          <div className="space-y-1.5">
            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="flex-1">
                  {item.productName} x{item.quantity}
                </span>
                <span className="tabular-nums">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="my-3 border-t border-dashed border-slate-300" />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="tabular-nums">-{formatCurrency(sale.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="tabular-nums">{formatCurrency(sale.tax)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm font-bold text-slate-900">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          <div className="my-3 border-t border-dashed border-slate-300" />

          <div className="space-y-0.5">
            <p className="capitalize">Payment Method: {sale.payment.method}</p>
            {sale.payment.amountReceived !== undefined && (
              <p>Amount Received: {formatCurrency(sale.payment.amountReceived)}</p>
            )}
            {sale.payment.change !== undefined && <p>Change: {formatCurrency(sale.payment.change)}</p>}
          </div>

          <p className="mt-4 text-center font-sans">{settings?.receiptFooter}</p>
        </div>
      )}
    </Modal>
  );
}
