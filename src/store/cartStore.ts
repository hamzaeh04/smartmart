import { create } from "zustand";
import type { Product } from "@/types";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

interface CartState {
  items: CartItem[];
  customerName: string;
  discount: number;
  addItem: (product: Product) => void;
  incrementQty: (productId: string) => void;
  decrementQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  setCustomerName: (name: string) => void;
  setDiscount: (amount: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerName: "",
  discount: 0,

  addItem: (product) => {
    if (product.currentStock <= 0) return;
    const existing = get().items.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.currentStock) return;
      set({
        items: get().items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      set({
        items: [
          ...get().items,
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            unitPrice: product.sellingPrice,
            quantity: 1,
            availableStock: product.currentStock,
          },
        ],
      });
    }
  },

  incrementQty: (productId) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId && i.quantity < i.availableStock ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    });
  },

  decrementQty: (productId) => {
    const item = get().items.find((i) => i.productId === productId);
    if (item && item.quantity <= 1) {
      set({ items: get().items.filter((i) => i.productId !== productId) });
      return;
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i,
      ),
    });
  },

  removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),

  setCustomerName: (name) => set({ customerName: name }),
  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),

  clearCart: () => set({ items: [], customerName: "", discount: 0 }),
}));
