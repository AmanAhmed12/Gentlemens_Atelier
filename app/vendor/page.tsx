import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, Wallet, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

export default async function VendorOverviewPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.sub } });
  if (!vendor) redirect("/");

  const [productCount, orderItems, lowStockProducts, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id } }),
    prisma.orderItem.findMany({
      where: { vendorId: vendor.id, order: { paymentStatus: "APPROVED" } },
      select: { quantity: true, priceAtPurchase: true },
    }),
    prisma.product.findMany({
      where: { vendorId: vendor.id, stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
      select: { id: true, title: true, stockQuantity: true },
      take: 5,
    }),
    prisma.orderItem.findMany({
      where: { vendorId: vendor.id, fulfillmentStatus: "PENDING" },
      include: { order: { select: { id: true, createdAt: true } }, product: { select: { title: true } } },
      take: 5,
      orderBy: { order: { createdAt: "desc" } },
    }),
  ]);

  const totalSales = orderItems.reduce((sum, item) => sum + Number(item.priceAtPurchase) * item.quantity, 0);

  return (
    <div>
      {vendor.status !== "APPROVED" && (
        <GlassCard className="mb-6 flex items-center gap-3 border-amber-500/30">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <p className="text-sm text-foreground/90">
            Your store status is <Badge status={vendor.status}>{vendor.status}</Badge>   product listings are hidden
            from customers until an administrator approves your account.
          </p>
        </GlassCard>
      )}

      <h1 className="font-display text-3xl text-foreground">Welcome, {vendor.storeName}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sales" value={formatPrice(totalSales)} icon={Wallet} />
        <StatCard label="Products Listed" value={productCount} icon={Package} accent="text-emerald" />
        <StatCard label="Pending Fulfillment" value={pendingOrders.length} icon={ShoppingCart} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="font-display text-lg text-foreground">Low Stock Alerts</h2>
          {lowStockProducts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex justify-between">
                  <span>{product.title}</span>
                  <Badge status="FAILED">{product.stockQuantity} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-lg text-foreground">Orders Awaiting Fulfillment</h2>
          {pendingOrders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {pendingOrders.map((item) => (
                <li key={item.id}>
                  <Link href="/vendor/orders" className="flex justify-between hover:text-gold-light">
                    <span>{item.product.title}</span>
                    <span className="text-muted">#{item.order.id.slice(-6).toUpperCase()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
