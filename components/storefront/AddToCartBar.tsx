"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";

export function AddToCartBar({ productId, stockQuantity }: { productId: string; stockQuantity: number }) {
  const { addItem } = useCart();
  const { show } = useToast();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = stockQuantity <= 0;

  return (
    <div className="flex items-center gap-4">
      <div className="glass flex items-center gap-3 rounded-full px-3 py-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="rounded-full p-1 hover:bg-white/10"
          disabled={outOfStock}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm">{quantity}</span>
        <button
          onClick={() => {
            if (quantity >= stockQuantity) {
              show(`Only ${stockQuantity} left in stock`, "info");
              return;
            }
            setQuantity((q) => q + 1);
          }}
          className="rounded-full p-1 hover:bg-white/10"
          disabled={outOfStock}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button onClick={() => addItem(productId, quantity)} disabled={outOfStock} size="lg" className="flex-1">
        <ShoppingBag className="h-4 w-4" /> {outOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
