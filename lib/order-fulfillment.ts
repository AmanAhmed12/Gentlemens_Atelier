import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export class InsufficientStockError extends Error {
  constructor(productTitle: string) {
    super(`${productTitle} no longer has enough stock`);
  }
}

interface ReservationInput {
  productId: string;
  productTitle: string;
  quantity: number;
}

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function reserveStock(client: DbClient, items: ReservationInput[]) {
  for (const item of items) {
    const result = await client.product.updateMany({
      where: { id: item.productId, isActive: true, stockQuantity: { gte: item.quantity } },
      data: { stockQuantity: { decrement: item.quantity } },
    });
    if (result.count === 0) {
      throw new InsufficientStockError(item.productTitle);
    }
  }
}

export async function approveOrderPayment(orderId: string, paymentRef?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "APPROVED") return order;

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "APPROVED", orderStatus: "PROCESSING", paymentRef },
  });

  return prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
}

export async function cancelOrderAndRestoreStock(orderId: string, customerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.customerId !== customerId) throw new Error("Order not found");
  if (order.paymentStatus === "APPROVED" || order.orderStatus === "CANCELLED") return order;

  await prisma.$transaction([
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      }),
    ),
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "FAILED", orderStatus: "CANCELLED" },
    }),
  ]);

  return prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
}
