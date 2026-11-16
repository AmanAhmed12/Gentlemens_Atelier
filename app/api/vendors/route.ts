import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");
  const vendors = await prisma.vendorProfile.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } : undefined,
    include: { user: { select: { name: true, email: true, createdAt: true } }, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vendors });
}
