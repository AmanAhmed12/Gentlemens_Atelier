import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [productCount, orderCount, customerCount, vendorCount, revenue, statusBreakdown, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
      prisma.order.aggregate({ where: { paymentStatus: "APPROVED" }, _sum: { totalAmount: true } }),
      prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 7,
        select: { createdAt: true, totalAmount: true, paymentStatus: true },
      }),
    ]);

  return NextResponse.json({
    productCount,
    orderCount,
    customerCount,
    vendorCount,
    totalRevenue: Number(revenue._sum.totalAmount ?? 0),
    statusBreakdown: statusBreakdown.map((row) => ({ status: row.orderStatus, count: row._count._all })),
    recentOrders,
  });
}
