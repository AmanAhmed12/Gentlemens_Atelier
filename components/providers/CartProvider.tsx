"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { apiFetch } from "@/lib/apiFetch";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: string;
    images: string[];
    stockQuantity: number;
    vendor: { storeName: string };
  };
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { show } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const res = await apiFetch("/api/cart");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await apiFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.status === 401) {
        show("Please log in to add items to your cart", "error");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        show(data.error ?? "Could not add item to cart", "error");
        return;
      }
      const data = await res.json();
      await refresh();
      if (data.capped) {
        show(`Only ${data.available} in stock   added the max available to your cart`, "info");
      } else {
        show("Added to cart", "success");
      }
      setIsOpen(true);
    },
    [refresh, show, router, pathname],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const res = await apiFetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        show(data.error ?? "Could not update quantity", "error");
        await refresh();
        return;
      }
      const data = await res.json();
      if (data.capped) {
        show(`Only ${data.available} in stock`, "info");
      }
      await refresh();
    },
    [refresh, show],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const res = await apiFetch(`/api/cart/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        show("Could not remove item from cart", "error");
      } else {
        show("Removed from cart", "success");
      }
      await refresh();
    },
    [refresh, show],
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        isOpen,
        itemCount,
        subtotal,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
