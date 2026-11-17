import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { cancelOrderAndRestoreStock } from "@/lib/order-fulfillment";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const order = await cancelOrderAndRestoreStock(id, user.sub);
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
