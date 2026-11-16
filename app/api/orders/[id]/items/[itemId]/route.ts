import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { orderItemStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const user = await requireRole(["VENDOR", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, itemId } = await params;
  const item = await prisma.orderItem.findUnique({
    where: { id: itemId },
    include: { vendor: true },
  });

  if (!item || item.orderId !== id) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  if (user.role === "VENDOR" && item.vendor.userId !== user.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = orderItemStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.orderItem.update({
    where: { id: itemId },
    data: { fulfillmentStatus: parsed.data.fulfillmentStatus },
  });

  const siblings = await prisma.orderItem.findMany({ where: { orderId: id } });
  const allSameStatus = siblings.every((sibling) => sibling.fulfillmentStatus === parsed.data.fulfillmentStatus);
  if (allSameStatus) {
    await prisma.order.update({ where: { id }, data: { orderStatus: parsed.data.fulfillmentStatus } });
  }

  return NextResponse.json({ item: updated });
}
