import { NextRequest, NextResponse } from "next/server";
import { verifyNotificationSignature } from "@/lib/payhere";
import { approveOrderPayment } from "@/lib/order-fulfillment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params = {
    merchant_id: String(form.get("merchant_id") ?? ""),
    order_id: String(form.get("order_id") ?? ""),
    payhere_amount: String(form.get("payhere_amount") ?? ""),
    payhere_currency: String(form.get("payhere_currency") ?? ""),
    status_code: String(form.get("status_code") ?? ""),
    md5sig: String(form.get("md5sig") ?? ""),
  };

  if (!verifyNotificationSignature(params)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (params.status_code === "2") {
    await approveOrderPayment(params.order_id, `PAYHERE-${params.order_id}`);
  }

  return NextResponse.json({ received: true });
}
