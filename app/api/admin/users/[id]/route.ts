import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { adminUpdateUserSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Admin accounts cannot be modified here" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = adminUpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.email && parsed.data.email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ error: "Another account already uses this email" }, { status: 409 });
    }
  }

  const { password, ...rest } = parsed.data;
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...rest,
      passwordHash: password ? await hashPassword(password) : undefined,
    },
    select: { id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true },
  });

  const action =
    typeof parsed.data.isSuspended === "boolean"
      ? parsed.data.isSuspended
        ? "USER_SUSPENDED"
        : "USER_REINSTATED"
      : "USER_UPDATED";
  await logAudit(admin.sub, action, "User", user.id);

  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Admin accounts cannot be deleted here" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  await logAudit(admin.sub, "USER_DELETED", "User", id);

  return NextResponse.json({ success: true });
}
