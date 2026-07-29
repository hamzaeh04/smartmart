import { create } from "zustand";

export type ScannerContext = "global" | "pos";

interface ScannerState {
  isOpen: boolean;
  context: ScannerContext;
  open: (context?: ScannerContext) => void;
  close: () => void;
}

export const useScannerStore = create<ScannerState>((set) => ({
  isOpen: false,
  context: "global",
  open: (context = "global") => set({ isOpen: true, context }),
  close: () => set({ isOpen: false }),
}));
