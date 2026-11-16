import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/rbac";
import { askGemini } from "@/lib/gemini";
import { chatMessageSchema } from "@/lib/validation";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the AI shopping assistant for "The Gentlemen's Atelier", an online multi-vendor
menswear marketplace. Help customers with product questions, sizing and availability, order status, and general
styling advice. Keep replies concise and friendly. If you are given order or product context below, use it to
answer precisely; otherwise answer generally. Never invent order numbers or stock figures that were not provided.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const user = await requireUser();
  const keywords = parsed.data.message
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 5);

  const [recentOrders, matchingProducts] = await Promise.all([
    user
      ? prisma.order.findMany({
          where: { customerId: user.sub },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { items: { include: { product: true } } },
        })
      : Promise.resolve([]),
    keywords.length
      ? prisma.product.findMany({
          where: {
            isActive: true,
            OR: keywords.map((word) => ({ title: { contains: word, mode: "insensitive" as const } })),
          },
          take: 5,
          include: { category: true },
        })
      : Promise.resolve([]),
  ]);

  const contextParts: string[] = [];
  if (recentOrders.length) {
    contextParts.push(
      "Customer's recent orders:\n" +
        recentOrders
          .map(
            (order) =>
              `- Order ${order.id.slice(-6)}: ${order.orderStatus}, payment ${order.paymentStatus}, total ${formatPrice(Number(order.totalAmount))}`,
          )
          .join("\n"),
    );
  }
  if (matchingProducts.length) {
    contextParts.push(
      "Relevant products in the catalog:\n" +
        matchingProducts
          .map(
            (product) =>
              `- ${product.title} (${product.category.name}): ${formatPrice(Number(product.price))}, ${product.stockQuantity > 0 ? "in stock" : "out of stock"}`,
          )
          .join("\n"),
    );
  }

  let history: { role: "USER" | "ASSISTANT"; message: string }[] = [];
  if (user) {
    history = await prisma.chatMessage.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    history.reverse();
  }

  const fullMessage = contextParts.length
    ? `${contextParts.join("\n\n")}\n\nCustomer question: ${parsed.data.message}`
    : parsed.data.message;

  let reply: string;
  try {
    reply = await askGemini(
      SYSTEM_PROMPT,
      history.map((turn) => ({ role: turn.role === "USER" ? "user" : "model", text: turn.message })),
      fullMessage,
    );
  } catch {
    reply = "I'm having trouble reaching the assistant right now. Please try again in a moment.";
  }

  if (user) {
    await prisma.chatMessage.createMany({
      data: [
        { userId: user.sub, role: "USER", message: parsed.data.message },
        { userId: user.sub, role: "ASSISTANT", message: reply },
      ],
    });
  }

  return NextResponse.json({ reply });
}
