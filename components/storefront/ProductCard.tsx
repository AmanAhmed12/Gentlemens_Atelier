"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  price: string | number;
  images: string[];
  stockQuantity: number;
  category: { name: string };
  vendor: { storeName: string };
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const outOfStock = product.stockQuantity <= 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass group overflow-hidden rounded-2xl transition-shadow hover:shadow-2xl hover:shadow-gold/10"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">No image</div>
          )}
          {outOfStock && (
            <span className="absolute left-3 top-3 rounded-full bg-burgundy/90 px-2.5 py-1 text-xs font-medium text-white">
              Out of stock
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted">{product.category.name}</p>
          <h3 className="mt-1 truncate font-display text-base text-foreground">{product.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{product.vendor.storeName}</p>
          <p className="mt-2 text-lg text-gold-light">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={() => addItem(product.id)}
          disabled={outOfStock}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 py-2 text-sm text-gold-light transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
