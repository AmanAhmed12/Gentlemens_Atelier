"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const gallery = images.length ? images : [""];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/5">
        {gallery[active] ? (
          <Image src={gallery[active]} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image available</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-xl border transition",
                idx === active ? "border-gold" : "border-white/10 opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt={`${title} ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
