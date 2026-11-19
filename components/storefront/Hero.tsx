"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xs uppercase tracking-[0.3em] text-gold-light"
        >
          Tailored Menswear, Reimagined
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          A Multi-Vendor Atelier for the
          <span className="text-gradient-gold"> Modern Gentleman</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-sm text-muted sm:text-base"
        >
          Shop curated suits, shirts, and accessories from independent textile houses   with secure
          checkout, real-time order tracking, and an AI stylist on hand whenever you need it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/products">
            <Button size="lg">Explore the Collection</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Sell on The Atelier
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
