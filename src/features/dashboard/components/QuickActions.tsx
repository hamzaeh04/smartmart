import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackagePlus, ClipboardPlus, ShoppingCart, QrCode, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useScannerStore } from "@/store/scannerStore";
import { StockAdjustmentModal } from "@/features/inventory/components/StockAdjustmentModal";

export function QuickActions() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const openScanner = useScannerStore((s) => s.open);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const actions = [
    can("products.manage") && {
      label: "Add Product",
      icon: PackagePlus,
      onClick: () => navigate("/products/new"),
      color: "bg-brand-50 text-brand-600",
    },
    can("purchases.manage") && {
      label: "Create Purchase",
      icon: ClipboardPlus,
      onClick: () => navigate("/purchases/new"),
      color: "bg-info-50 text-info-600",
    },
    can("pos.access") && {
      label: "Open POS",
      icon: ShoppingCart,
      onClick: () => navigate("/pos"),
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "Scan Product",
      icon: QrCode,
      onClick: () => openScanner("global"),
      color: "bg-warning-50 text-warning-600",
    },
    can("inventory.manage") && {
      label: "Adjust Stock",
      icon: SlidersHorizontal,
      onClick: () => setAdjustOpen(true),
      color: "bg-danger-50 text-danger-600",
    },
  ].filter(Boolean) as { label: string; icon: typeof PackagePlus; onClick: () => void; color: string }[];

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 px-3 py-4 text-center transition-colors hover:border-slate-200 hover:bg-slate-50"
          >
            <span className={`flex size-10 items-center justify-center rounded-lg ${action.color}`}>
              <action.icon className="size-5" />
            </span>
            <span className="text-xs font-medium text-slate-600">{action.label}</span>
          </button>
        ))}
      </div>
      <StockAdjustmentModal isOpen={adjustOpen} onClose={() => setAdjustOpen(false)} />
    </Card>
  );
}
