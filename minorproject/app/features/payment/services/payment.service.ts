import crypto from "crypto";
import { db } from "@/app/lib/db";
import { bookingsTable, paymentsTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export interface PaymentInitiateParams {
  bookingId: number;
  userId: number;
  amount: number;
  paymentMethod: "esewa" | "khalti" | "stripe" | "cash";
  productName: string;
}

// 1. Generate eSewa v2 signature (HMAC-SHA256)
export function generateEsewaSignature(
  totalAmount: number,
  transactionUuid: string,
  productCode: string = "EPAYTEST"
) {
  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("base64");
}

// 2. Create Payment Record in Database
export async function createPaymentRecord(params: PaymentInitiateParams) {
  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      bookingId: params.bookingId,
      userId: params.userId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionId,
      status: "pending",
    })
    .returning();

  return { payment, transactionId };
}

// 3. Mark Payment Complete & Update Booking
export async function finalizePayment(
  transactionId: string,
  status: "completed" | "failed",
  paymentData?: any
) {
  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.transactionId, transactionId));

  if (!payment) {
    throw new Error("Payment record not found");
  }

  await db
    .update(paymentsTable)
    .set({
      status,
      paymentData: paymentData ? JSON.stringify(paymentData) : null,
    })
    .where(eq(paymentsTable.id, payment.id));

  if (payment.bookingId && status === "completed") {
    await db
      .update(bookingsTable)
      .set({
        paymentStatus: "completed",
        status: "confirmed",
      })
      .where(eq(bookingsTable.id, payment.bookingId));
  }

  return payment;
}
