import { LayoutDashboard, Users, Store, Tags, Package, ShoppingCart, ScrollText } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

const iconClass = "h-4 w-4";

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className={iconClass} /> },
  { href: "/admin/users", label: "Users", icon: <Users className={iconClass} /> },
  { href: "/admin/vendors", label: "Vendors", icon: <Store className={iconClass} /> },
  { href: "/admin/categories", label: "Categories", icon: <Tags className={iconClass} /> },
  { href: "/admin/products", label: "Products", icon: <Package className={iconClass} /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingCart className={iconClass} /> },
  { href: "/admin/audit-log", label: "Audit Log", icon: <ScrollText className={iconClass} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Admin" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
