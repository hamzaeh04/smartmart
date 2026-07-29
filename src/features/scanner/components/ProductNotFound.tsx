import { Plus, RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

interface ProductNotFoundProps {
  scannedValue: string;
  onScanAgain: () => void;
  onEnterManually: () => void;
  onAddNewProduct: () => void;
}

export function ProductNotFound({ scannedValue, onScanAgain, onEnterManually, onAddNewProduct }: ProductNotFoundProps) {
  const { can } = useAuth();

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <SearchX className="size-6" />
      </div>
      <div>
        <p className="text-base font-semibold text-slate-900">Product Not Found</p>
        <p className="mt-1 text-sm text-slate-500">
          This code does not match any product in the system.
        </p>
        <p className="mt-2 rounded-md bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">{scannedValue}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <Button leftIcon={<RotateCcw className="size-4" />} onClick={onScanAgain}>
          Scan Again
        </Button>
        <Button variant="outline" onClick={onEnterManually}>
          Enter Code Manually
        </Button>
        {can("products.manage") && (
          <Button variant="outline" leftIcon={<Plus className="size-4" />} onClick={onAddNewProduct}>
            Add New Product
          </Button>
        )}
      </div>
    </div>
  );
}
