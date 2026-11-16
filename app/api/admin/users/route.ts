import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { adminCreateUserSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireRole(["ADMIN"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isSuspended: true,
      createdAt: true,
      vendorProfile: { select: { storeName: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = adminCreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, role, storeName, businessRegNo } = parsed.data;
  if (role === "VENDOR" && (!storeName || !businessRegNo)) {
    return NextResponse.json({ error: "Store name and business registration number are required for vendors" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      vendorProfile:
        role === "VENDOR"
          ? { create: { storeName: storeName!, businessRegNo: businessRegNo!, status: "APPROVED" } }
          : undefined,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await logAudit(admin.sub, "USER_CREATED", "User", newUser.id, { role });

  return NextResponse.json({ user: newUser }, { status: 201 });
}
