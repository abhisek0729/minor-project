import { NextRequest, NextResponse } from "next/server";
import { finalizePayment } from "@/app/features/payment/services/payment.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const txn = searchParams.get("txn") || searchParams.get("transaction_uuid");

  if (!txn) {
    return NextResponse.redirect(new URL("/bookings?error=missing_transaction", req.url));
  }

  try {
    if (status === "success") {
      await finalizePayment(txn, "completed", { gateway: "esewa", verified: true });
      return NextResponse.redirect(new URL("/bookings?payment=success", req.url));
    } else {
      await finalizePayment(txn, "failed", { gateway: "esewa", reason: "User cancelled or failed" });
      return NextResponse.redirect(new URL("/bookings?payment=failed", req.url));
    }
  } catch (error) {
    console.error("eSewa callback error:", error);
    return NextResponse.redirect(new URL("/bookings?error=callback_failed", req.url));
  }
}
