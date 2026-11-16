"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function DashboardShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="glass-strong hidden w-64 flex-col border-r border-white/10 p-6 lg:flex">
        <Link href="/" className="font-display text-lg text-gradient-gold">
          The Gentlemen&apos;s Atelier
        </Link>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted">{title}</p>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-gold/15 text-gold-light" : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/70 hover:bg-white/5">
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-burgundy hover:bg-white/5">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-white/10 bg-background/60 px-6 py-4 backdrop-blur-xl lg:hidden">
          <span className="font-display text-lg text-gradient-gold">{title}</span>
          <button onClick={logout} className="text-sm text-burgundy">
            Logout
          </button>
        </header>
        <header className="hidden items-center justify-end border-b border-white/10 px-8 py-4 lg:flex">
          <span className="text-sm text-muted">Signed in as {user?.name}</span>
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
