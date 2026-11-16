import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { vendorProfileUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireRole(["VENDOR"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.sub } });
  if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  return NextResponse.json({ vendor });
}

export async function PATCH(req: NextRequest) {
  const user = await requireRole(["VENDOR"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = vendorProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const vendor = await prisma.vendorProfile.update({
    where: { userId: user.sub },
    data: parsed.data,
  });

  return NextResponse.json({ vendor });
}
