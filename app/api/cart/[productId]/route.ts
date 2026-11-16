import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { cartUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = cartUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const quantity = Math.min(parsed.data.quantity, product.stockQuantity);

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: user.sub, productId } },
    data: { quantity },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await params;
  await prisma.cartItem.deleteMany({ where: { userId: user.sub, productId } });
  return NextResponse.json({ success: true });
}
