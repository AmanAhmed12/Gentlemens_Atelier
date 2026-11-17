"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const { show } = useToast();

  return (
    <Drawer open={isOpen} onClose={closeCart} title="Your Cart">
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted">
          <ShoppingBag className="h-10 w-10" />
          <p>Your cart is empty.</p>
          <Link href="/products" onClick={closeCart}>
            <Button variant="secondary" size="sm">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass flex gap-3 rounded-xl p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.product.title}</p>
                  <p className="text-xs text-muted">{item.product.vendor.storeName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="rounded-full border border-white/10 p-1 hover:border-gold/50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity >= item.product.stockQuantity) {
                            show(`Only ${item.product.stockQuantity} of ${item.product.title} in stock`, "info");
                            return;
                          }
                          updateQuantity(item.productId, item.quantity + 1);
                        }}
                        className="rounded-full border border-white/10 p-1 hover:border-gold/50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-gold-light">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-muted hover:text-burgundy">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-lg text-gold-light">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
