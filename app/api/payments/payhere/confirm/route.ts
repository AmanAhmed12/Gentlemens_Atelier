import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { approveOrderPayment } from "@/lib/order-fulfillment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (process.env.PAYHERE_TRUST_RETURN_REDIRECT !== "true") {
    return NextResponse.json(
      { error: "Local sandbox confirmation is disabled. Set PAYHERE_TRUST_RETURN_REDIRECT=true for local demo use." },
      { status: 403 },
    );
  }

  const user = await requireRole(["CUSTOMER"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== user.sub) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updated = await approveOrderPayment(orderId, `SANDBOX-${orderId}`);
  return NextResponse.json({ order: updated });
}
