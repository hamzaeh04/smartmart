import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Flashlight, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { CameraPreview } from "./components/CameraPreview";
import { ProductScanResult } from "./components/ProductScanResult";
import { ProductNotFound } from "./components/ProductNotFound";
import { useBarcodeScanner } from "./useBarcodeScanner";
import { useScannerStore } from "@/store/scannerStore";
import { useCartStore } from "@/store/cartStore";
import { useProductLookup } from "@/features/products/hooks";
import { StockAdjustmentModal } from "@/features/inventory/components/StockAdjustmentModal";
import { ProductLabelModal } from "@/features/products/components/ProductLabelModal";
import { toast } from "@/store/toastStore";
import type { Product } from "@/types";

type Phase = "scanning" | "looking-up" | "result" | "not-found";

export function ProductScanner() {
  const isOpen = useScannerStore((s) => s.isOpen);
  const context = useScannerStore((s) => s.context);
  const closeScanner = useScannerStore((s) => s.close);
  const addToCart = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("scanning");
  const [scannedValue, setScannedValue] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);

  const lookup = useProductLookup();

  const scanner = useBarcodeScanner({
    active: isOpen && phase === "scanning",
    onDecode: (value) => handleCode(value),
  });

  useEffect(() => {
    if (isOpen) {
      setPhase("scanning");
      setScannedValue("");
      setProduct(null);
      setManualCode("");
    }
  }, [isOpen]);

  function handleCode(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setScannedValue(trimmed);
    setPhase("looking-up");
    lookup.mutate(trimmed, {
      onSuccess: (found) => {
        setProduct(found);
        setPhase("result");
      },
      onError: () => {
        setPhase("not-found");
      },
    });
  }

  function handleManualSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (manualCode.trim()) handleCode(manualCode);
  }

  function handleClose() {
    closeScanner();
  }

  function handleScanAgain() {
    setPhase("scanning");
    setProduct(null);
    setScannedValue("");
    setManualCode("");
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(product);
    toast({ variant: "success", title: "Added to cart", description: product.name });
    handleClose();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Scan Product" size="lg">
        {phase === "scanning" && (
          <div className="space-y-4">
            {scanner.error ? (
              <div className="flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Camera unavailable</p>
                  <p className="mt-0.5">{scanner.error.message}</p>
                </div>
              </div>
            ) : (
              <CameraPreview videoRef={scanner.videoRef} isScanning={scanner.isScanning} />
            )}

            {(scanner.devices.length > 1 || scanner.torchSupported) && !scanner.error && (
              <div className="flex items-center gap-3">
                {scanner.devices.length > 1 && (
                  <Select
                    containerClassName="flex-1"
                    value={scanner.selectedDeviceId}
                    onChange={(e) => scanner.switchDevice(e.target.value)}
                    options={scanner.devices.map((d, i) => ({ value: d.deviceId, label: d.label || `Camera ${i + 1}` }))}
                  />
                )}
                {scanner.torchSupported && (
                  <Button
                    type="button"
                    variant={scanner.torchOn ? "primary" : "outline"}
                    size="icon"
                    aria-label="Toggle flashlight"
                    onClick={scanner.toggleTorch}
                  >
                    <Flashlight className="size-4" />
                  </Button>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Or enter code manually</p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter SKU, barcode, or QR value..."
                  containerClassName="flex-1"
                  aria-label="Manual product code"
                />
                <Button type="submit" leftIcon={<Search className="size-4" />}>
                  Search Product
                </Button>
              </form>
            </div>
          </div>
        )}

        {phase === "looking-up" && (
          <div className="py-10">
            <LoadingSpinner label="Looking up product" />
          </div>
        )}

        {phase === "result" && product && (
          <ProductScanResult
            product={product}
            showAddToCart={context === "pos"}
            onAddToCart={handleAddToCart}
            onEdit={() => {
              handleClose();
              navigate(`/products/${product.id}/edit`);
            }}
            onAdjustStock={() => setAdjustOpen(true)}
            onViewHistory={() => {
              handleClose();
              navigate(`/inventory/history?productId=${product.id}`);
            }}
            onPrintLabel={() => setLabelOpen(true)}
            onScanAgain={handleScanAgain}
            onClose={handleClose}
          />
        )}

        {phase === "not-found" && (
          <ProductNotFound
            scannedValue={scannedValue}
            onScanAgain={handleScanAgain}
            onEnterManually={() => setPhase("scanning")}
            onAddNewProduct={() => {
              handleClose();
              navigate("/products/new");
            }}
          />
        )}
      </Modal>

      {product && (
        <>
          <StockAdjustmentModal isOpen={adjustOpen} onClose={() => setAdjustOpen(false)} productId={product.id} />
          <ProductLabelModal isOpen={labelOpen} onClose={() => setLabelOpen(false)} product={product} />
        </>
      )}
    </>
  );
}
