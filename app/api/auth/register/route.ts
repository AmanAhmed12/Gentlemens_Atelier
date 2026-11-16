import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setAuthCookies } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      vendorProfile:
        role === "VENDOR"
          ? {
              create: {
                storeName: storeName!,
                businessRegNo: businessRegNo!,
                status: "PENDING",
              },
            }
          : undefined,
    },
  });

  await setAuthCookies({ sub: user.id, role: user.role, name: user.name, email: user.email });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
