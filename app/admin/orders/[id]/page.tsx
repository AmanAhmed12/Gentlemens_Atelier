"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderDetail {
  id: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  customer: { name: string; email: string };
  items: {
    id: string;
    quantity: number;
    priceAtPurchase: string;
    fulfillmentStatus: string;
    product: { title: string };
    vendor: { storeName: string };
  }[];
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    apiFetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data.order));
  }, [params.id]);

  if (!order) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-foreground">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <div className="flex gap-2">
          <Badge status={order.paymentStatus}>{order.paymentStatus}</Badge>
          <Badge status={order.orderStatus}>{order.orderStatus}</Badge>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">Placed on {formatDate(order.createdAt)} by {order.customer.name} ({order.customer.email})</p>

      <GlassCard className="mt-6">
        <h2 className="font-display text-lg text-foreground">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-foreground/90">{item.product.title}</p>
                <p className="text-xs text-muted">{item.vendor.storeName} &middot; Qty {item.quantity} &middot; {item.fulfillmentStatus}</p>
              </div>
              <span className="text-gold-light">{formatPrice(Number(item.priceAtPurchase) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-lg">
          <span>Total</span>
          <span className="text-gold-light">{formatPrice(order.totalAmount)}</span>
        </div>
      </GlassCard>

      <GlassCard className="mt-6">
        <h2 className="font-display text-lg text-foreground">Shipping</h2>
        <p className="mt-2 text-sm text-foreground/80">
          {order.shippingName}<br />{order.shippingAddress}, {order.shippingCity}<br />{order.shippingPhone}
        </p>
      </GlassCard>
    </div>
  );
}
