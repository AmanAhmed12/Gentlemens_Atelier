"use client";

import { useState } from "react";
import Script from "next/script";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    payhere: {
      startPayment: (payload: Record<string, string>) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, refresh } = useCart();
  const { show } = useToast();
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "",
  });

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      show("Your cart is empty", "error");
      return;
    }
    if (!sdkReady) {
      show("Payment gateway is still loading, please try again in a moment", "error");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        show(orderData.error ?? "Could not place order", "error");
        return;
      }

      const checkoutRes = await apiFetch("/api/payments/payhere/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });
      const payment = await checkoutRes.json();
      if (!checkoutRes.ok) {
        show(payment.error ?? "Could not start payment", "error");
        return;
      }

      window.payhere.onCompleted = async (completedOrderId: string) => {
        await apiFetch("/api/payments/payhere/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: completedOrderId }),
        });
        await refresh();
        show("Payment approved — thank you!", "success");
        router.push(`/orders/${completedOrderId}`);
      };
      window.payhere.onDismissed = () => show("Payment was cancelled", "info");
      window.payhere.onError = (error: string) => show(`Payment error: ${error}`, "error");

      window.payhere.startPayment({
        sandbox: payment.sandbox ? "true" : "false",
        merchant_id: payment.merchantId,
        return_url: payment.returnUrl,
        cancel_url: payment.cancelUrl,
        notify_url: payment.notifyUrl,
        order_id: payment.orderId,
        items: payment.items,
        amount: payment.amount,
        currency: payment.currency,
        hash: payment.hash,
        first_name: payment.firstName,
        last_name: payment.lastName,
        email: payment.email,
        phone: payment.phone,
        address: payment.address,
        city: payment.city,
        country: "Sri Lanka",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://www.payhere.lk/lib/payhere.js" onReady={() => setSdkReady(true)} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl text-foreground">Checkout</h1>
        <p className="mt-2 text-sm text-muted">
          Payments are processed through the PayHere sandbox — no real charge will occur.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <GlassCard strong>
            <h2 className="font-display text-lg text-foreground">Shipping Details</h2>
            <form onSubmit={handlePay} className="mt-5 flex flex-col gap-4">
              <Input
                label="Full Name"
                required
                value={form.shippingName}
                onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
              />
              <Input
                label="Phone Number"
                required
                value={form.shippingPhone}
                onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })}
              />
              <Input
                label="Address"
                required
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              />
              <Input
                label="City"
                required
                value={form.shippingCity}
                onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
              />
              <Button type="submit" size="lg" loading={loading} className="mt-2">
                Pay with PayHere (Sandbox)
              </Button>
            </form>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-lg text-foreground">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground/80">
                    {item.product.title} &times; {item.quantity}
                  </span>
                  <span className="text-gold-light">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-lg">
              <span>Total</span>
              <span className="text-gold-light">{formatPrice(subtotal)}</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
