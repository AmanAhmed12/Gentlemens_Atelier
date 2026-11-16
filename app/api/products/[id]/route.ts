import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/rbac";
import { productUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, vendor: { select: { id: true, storeName: true, status: true } } },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { vendor: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const isOwner = user.role === "VENDOR" && product.vendor.userId === user.sub;
  if (!isOwner && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = { ...parsed.data };
  if (user.role !== "ADMIN") {
    delete data.vendorId;
  } else if (data.vendorId) {
    const vendorExists = await prisma.vendorProfile.findUnique({ where: { id: data.vendorId } });
    if (!vendorExists) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const updated = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["VENDOR", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { vendor: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const isOwner = user.role === "VENDOR" && product.vendor.userId === user.sub;
  if (!isOwner && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
