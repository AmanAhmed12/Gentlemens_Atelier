import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/rbac";
import { checkoutSchema } from "@/lib/validation";
import { InsufficientStockError, reserveStock } from "@/lib/order-fulfillment";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "CUSTOMER") {
    const orders = await prisma.order.findMany({
      where: { customerId: user.sub },
      include: { items: { include: { product: true, vendor: { select: { storeName: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  if (user.role === "VENDOR") {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.sub } });
    if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: { paymentStatus: "APPROVED", items: { some: { vendorId: vendor.id } } },
      include: {
        items: { where: { vendorId: vendor.id }, include: { product: true } },
        customer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true, vendor: { select: { storeName: true } } } },
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid shipping details" }, { status: 400 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.sub },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  try {
    const order = await prisma.$transaction(async (tx) => {
      await reserveStock(
        tx,
        cartItems.map((item) => ({
          productId: item.productId,
          productTitle: item.product.title,
          quantity: item.quantity,
        })),
      );

      const created = await tx.order.create({
        data: {
          customerId: user.sub,
          totalAmount,
          ...parsed.data,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              vendorId: item.product.vendorId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({
        where: { userId: user.sub, productId: { in: cartItems.map((item) => item.productId) } },
      });

      return created;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
