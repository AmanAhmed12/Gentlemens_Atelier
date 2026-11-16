"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProductCard, type ProductCardData } from "@/components/storefront/ProductCard";

export function FeaturedCarousel({ title, products }: { title: string; products: ProductCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products.length]);

  function scrollByAmount(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <div className="hidden items-center gap-3 sm:flex">
          <ArrowButton direction="left" disabled={!canScrollLeft} onClick={() => scrollByAmount(-1)} />
          <ArrowButton direction="right" disabled={!canScrollRight} onClick={() => scrollByAmount(1)} />
        </div>
      </div>

      <div className="relative mt-6">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent transition-opacity",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent transition-opacity",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        <div ref={trackRef} className="scroll-hidden flex gap-5 overflow-x-auto scroll-smooth">
          {products.map((product) => (
            <div key={product.id} className="w-60 shrink-0 sm:w-64">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      className={cn(
        "glass flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        disabled
          ? "cursor-not-allowed border-white/10 text-muted/40"
          : "border-gold/40 text-gold-light hover:bg-gold/10 hover:shadow-[0_0_20px_-4px_rgba(201,162,39,0.6)]",
      )}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
    >
      <Icon className="h-5 w-5" />
    </motion.button>
  );
}
