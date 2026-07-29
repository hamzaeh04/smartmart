import { Store } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { QrCodeDisplay } from "@/components/ui/QrCodeDisplay";
import { BarcodeDisplay } from "@/components/ui/BarcodeDisplay";
import { formatCurrency } from "@/utils/format";
import type { Product } from "@/types";

interface ProductLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function ProductLabelModal({ isOpen, onClose, product }: ProductLabelModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Product Label"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.print()}>Print Label</Button>
        </>
      }
    >
      <div id="printable-area" className="flex justify-center">
        <div className="w-64 rounded-lg border border-slate-200 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Store className="size-4 text-brand-600" />
            <span className="text-xs font-bold tracking-tight text-slate-900">SmartMart</span>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">{product.name}</p>
          <p className="text-xs text-slate-500">SKU: {product.sku}</p>
          <p className="mt-1 text-lg font-bold text-brand-700">{formatCurrency(product.sellingPrice)}</p>
          <div className="mt-2 flex justify-center">
            <QrCodeDisplay value={product.qrCode} size={110} />
          </div>
          <div className="mt-1 flex justify-center">
            <BarcodeDisplay value={product.barcode} height={40} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
