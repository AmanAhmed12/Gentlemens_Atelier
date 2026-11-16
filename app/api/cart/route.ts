import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { cartAddSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ items: [] });

  const items = await prisma.cartItem.findMany({
    where: { userId: user.sub },
    include: { product: { include: { vendor: { select: { storeName: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = cartAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product is not available" }, { status: 404 });
  }
  if (product.stockQuantity < 1) {
    return NextResponse.json({ error: "This product is out of stock" }, { status: 409 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.sub, productId: product.id } },
  });

  const desiredQuantity = Math.min(
    product.stockQuantity,
    (existing?.quantity ?? 0) + parsed.data.quantity,
  );

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.sub, productId: product.id } },
    update: { quantity: desiredQuantity },
    create: { userId: user.sub, productId: product.id, quantity: desiredQuantity },
  });

  return NextResponse.json({ item });
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.cartItem.deleteMany({ where: { userId: user.sub } });
  return NextResponse.json({ success: true });
}
