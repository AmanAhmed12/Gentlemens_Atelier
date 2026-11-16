"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/#about", label: "About" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const { show } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    show("Logged out successfully", "success");
  }

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "VENDOR" ? "/vendor" : null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl tracking-wide text-gradient-gold">
          The Gentlemen&apos;s Atelier
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-foreground/80 transition hover:text-gold-light">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={openCart}
            className="relative rounded-full p-2 text-foreground/80 transition hover:bg-white/10 hover:text-gold-light"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-[#1a1408]"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {dashboardHref && (
                <Link href={dashboardHref}>
                  <Button variant="secondary" size="sm">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                </Link>
              )}
              {user.role === "CUSTOMER" && (
                <Link href="/account">
                  <Button variant="secondary" size="sm">
                    <User className="h-4 w-4" /> {user.name.split(" ")[0]}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-strong mx-4 mb-4 flex flex-col gap-3 rounded-2xl p-5 md:hidden"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-foreground/80">
              {link.label}
            </Link>
          ))}
          <button onClick={openCart} className="flex items-center gap-2 text-sm text-foreground/80">
            <ShoppingBag className="h-4 w-4" /> Cart ({itemCount})
          </button>
          {user ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref} className="text-sm text-gold-light">
                  Dashboard
                </Link>
              )}
              {user.role === "CUSTOMER" && (
                <Link href="/account" className="text-sm text-foreground/80">
                  My Account
                </Link>
              )}
              <button onClick={handleLogout} className="text-left text-sm text-burgundy">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-foreground/80">
                Login
              </Link>
              <Link href="/register" className="text-sm text-gold-light">
                Register
              </Link>
            </>
          )}
        </motion.div>
      )}
    </header>
  );
}
