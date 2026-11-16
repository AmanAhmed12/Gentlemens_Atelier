import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, vendor: { select: { storeName: true, userId: true } } } },
      customer: { select: { name: true, email: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const ownsAsCustomer = user.role === "CUSTOMER" && order.customerId === user.sub;
  const ownsAsVendor = user.role === "VENDOR" && order.items.some((item) => item.vendor.userId === user.sub);
  const isAdmin = user.role === "ADMIN";

  if (!ownsAsCustomer && !ownsAsVendor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (ownsAsVendor && !isAdmin) {
    order.items = order.items.filter((item) => item.vendor.userId === user.sub);
  }

  return NextResponse.json({ order });
}
