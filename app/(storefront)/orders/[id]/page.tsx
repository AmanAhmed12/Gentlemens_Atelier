import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true, vendor: { select: { storeName: true } } } } },
  });

  if (!order || order.customerId !== user.sub) notFound();

  const currentStep = Math.max(0, STEPS.indexOf(order.orderStatus as typeof STEPS[number]));
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/account/orders" className="text-sm text-gold-light hover:underline">
        &larr; Back to order history
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-foreground">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <div className="flex gap-2">
          <Badge status={order.paymentStatus}>Payment {order.paymentStatus}</Badge>
          <Badge status={order.orderStatus}>{order.orderStatus}</Badge>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>

      {!isCancelled && (
        <GlassCard className="mt-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  {idx <= currentStep ? (
                    <CheckCircle2 className="h-6 w-6 text-gold-light" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted" />
                  )}
                  <span className={cn("text-xs", idx <= currentStep ? "text-foreground" : "text-muted")}>{step}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn("mx-2 h-px flex-1", idx < currentStep ? "bg-gold" : "bg-white/10")} />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="mt-6">
        <h2 className="font-display text-lg text-foreground">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-foreground/90">{item.product.title}</p>
                <p className="text-xs text-muted">
                  {item.vendor.storeName} &middot; Qty {item.quantity} &middot; Status: {item.fulfillmentStatus}
                </p>
              </div>
              <span className="text-gold-light">{formatPrice(Number(item.priceAtPurchase) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-lg">
          <span>Total</span>
          <span className="text-gold-light">{formatPrice(Number(order.totalAmount))}</span>
        </div>
      </GlassCard>

      <GlassCard className="mt-6">
        <h2 className="font-display text-lg text-foreground">Shipping To</h2>
        <p className="mt-2 text-sm text-foreground/80">
          {order.shippingName}
          <br />
          {order.shippingAddress}, {order.shippingCity}
          <br />
          {order.shippingPhone}
        </p>
      </GlassCard>
    </div>
  );
}
