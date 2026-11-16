import { LayoutDashboard, Package, ShoppingCart, Store } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

const iconClass = "h-4 w-4";

const navItems: NavItem[] = [
  { href: "/vendor", label: "Overview", icon: <LayoutDashboard className={iconClass} /> },
  { href: "/vendor/products", label: "Products", icon: <Package className={iconClass} /> },
  { href: "/vendor/orders", label: "Orders", icon: <ShoppingCart className={iconClass} /> },
  { href: "/vendor/profile", label: "Store Profile", icon: <Store className={iconClass} /> },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Vendor" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
