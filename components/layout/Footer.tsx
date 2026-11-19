import Link from "next/link";
import { Globe, Camera, AtSign, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-lg text-gradient-gold">The Gentlemen&apos;s Atelier</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A curated multi-vendor marketplace for tailored menswear   bringing independent textile
              houses and discerning customers together on one secure platform.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/products" className="hover:text-gold-light">All Products</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-gold-light">New Arrivals</Link></li>
              <li><Link href="/register" className="hover:text-gold-light">Become a Vendor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@gentlemensatelier.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +94 11 234 5678</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Follow</h4>
            <div className="mt-3 flex gap-3">
              <a href="#" className="rounded-full border border-white/10 p-2 text-muted transition hover:border-gold/50 hover:text-gold-light"><Globe className="h-4 w-4" /></a>
              <a href="#" className="rounded-full border border-white/10 p-2 text-muted transition hover:border-gold/50 hover:text-gold-light"><Camera className="h-4 w-4" /></a>
              <a href="#" className="rounded-full border border-white/10 p-2 text-muted transition hover:border-gold/50 hover:text-gold-light"><AtSign className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} The Gentlemen&apos;s Atelier. Academic project demo   no real transactions are processed.
        </div>
      </div>
    </footer>
  );
}
