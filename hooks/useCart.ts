"use client";

import { create } from "zustand";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    stock: number;
  };
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  total: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  itemCount: 0,
  total: 0,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        set({
          items,
          itemCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
          total: items.reduce((sum: number, i: CartItem) => sum + i.product.price * i.quantity, 0),
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity, size, color) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, size, color }),
    });
    if (res.ok) await get().fetchCart();
  },

  updateQuantity: async (itemId, quantity) => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) await get().fetchCart();
  },

  removeItem: async (itemId) => {
    const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
    if (res.ok) await get().fetchCart();
  },

  clearCart: async () => {
    await fetch("/api/cart", { method: "DELETE" });
    set({ items: [], itemCount: 0, total: 0 });
  },
}));
