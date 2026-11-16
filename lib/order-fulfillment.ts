import { prisma } from "@/lib/db";

export async function approveOrderPayment(orderId: string, paymentRef?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "APPROVED") return order;

  await prisma.$transaction([
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      }),
    ),
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "APPROVED", orderStatus: "PROCESSING", paymentRef },
    }),
    prisma.cartItem.deleteMany({ where: { userId: order.customerId } }),
  ]);

  return prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
}
