import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { profileUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true },
  });

  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const profile = await prisma.user.update({
    where: { id: user.sub },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true },
  });
  return NextResponse.json({ profile });
}
