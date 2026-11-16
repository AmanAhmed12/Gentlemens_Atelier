import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { generateCheckoutHash } from "@/lib/payhere";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== user.sub) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "APPROVED") {
    return NextResponse.json({ error: "This order has already been paid for" }, { status: 409 });
  }

  const amount = Number(order.totalAmount);
  const hash = generateCheckoutHash(order.id, amount, "LKR");
  const [firstName, ...rest] = order.shippingName.split(" ");

  return NextResponse.json({
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    sandbox: process.env.PAYHERE_MODE !== "live",
    orderId: order.id,
    items: "The Gentlemen's Atelier Order",
    amount: amount.toFixed(2),
    currency: "LKR",
    hash,
    firstName: firstName || order.shippingName,
    lastName: rest.join(" ") || "-",
    email: user.email,
    phone: order.shippingPhone,
    address: order.shippingAddress,
    city: order.shippingCity,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payhere/notify`,
  });
}
