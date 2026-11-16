import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: user.sub },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Order History</h1>

      {orders.length === 0 ? (
        <GlassCard className="mt-8 text-center text-muted">You haven&apos;t placed any orders yet.</GlassCard>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <GlassCard className="flex flex-wrap items-center justify-between gap-3 transition hover:border-gold/40">
                <div>
                  <p className="font-medium text-foreground">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted">{formatDate(order.createdAt)} &middot; {order.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={order.paymentStatus}>{order.paymentStatus}</Badge>
                  <Badge status={order.orderStatus}>{order.orderStatus}</Badge>
                  <span className="text-gold-light">{formatPrice(Number(order.totalAmount))}</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
