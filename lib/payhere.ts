import crypto from "crypto";

function getConfig() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) {
    throw new Error("PayHere sandbox credentials are not set");
  }
  return { merchantId, merchantSecret };
}

function secretHash(merchantSecret: string) {
  return crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
}

export function generateCheckoutHash(orderId: string, amount: number, currency = "LKR") {
  const { merchantId, merchantSecret } = getConfig();
  const amountFormatted = amount.toFixed(2);
  const raw = `${merchantId}${orderId}${amountFormatted}${currency}${secretHash(merchantSecret)}`;
  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}

export function verifyNotificationSignature(params: PayHereNotification) {
  const { merchantSecret } = getConfig();
  const raw = `${params.merchant_id}${params.order_id}${params.payhere_amount}${params.payhere_currency}${params.status_code}${secretHash(merchantSecret)}`;
  const expected = crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
  return expected === params.md5sig;
}
