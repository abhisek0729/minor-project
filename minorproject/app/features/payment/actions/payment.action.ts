"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  createPaymentRecord,
  finalizePayment,
  generateEsewaSignature,
} from "../services/payment.service";
import { ApiResponse } from "@/app/types/api";

export async function initiatePayment(data: {
  bookingId: number;
  amount: number;
  paymentMethod: "esewa" | "khalti" | "stripe" | "cash";
  productName: string;
}): Promise<
  ApiResponse<{
    paymentId: number;
    transactionId: string;
    esewaPayload?: any;
    khaltiPayload?: any;
  }>
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Please sign in to proceed with payment." };
    }

    const { payment, transactionId } = await createPaymentRecord({
      bookingId: data.bookingId,
      userId: Number(session.user.id),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      productName: data.productName,
    });

    if (data.paymentMethod === "esewa") {
      const signature = generateEsewaSignature(data.amount, transactionId);
      return {
        success: true,
        message: "eSewa checkout initiated successfully",
        data: {
          paymentId: payment.id,
          transactionId,
          esewaPayload: {
            amount: data.amount,
            tax_amount: 0,
            total_amount: data.amount,
            transaction_uuid: transactionId,
            product_code: "EPAYTEST",
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/payments/esewa?status=success&txn=${transactionId}`,
            failure_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/payments/esewa?status=failed&txn=${transactionId}`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
          },
        },
      };
    }

    // Direct / Mock / Cash / Khalti
    if (data.paymentMethod === "cash" || data.paymentMethod === "stripe" || data.paymentMethod === "khalti") {
      await finalizePayment(transactionId, "completed", {
        gateway: data.paymentMethod,
        simulated: true,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Payment processed successfully!",
        data: {
          paymentId: payment.id,
          transactionId,
        },
      };
    }

    return {
      success: true,
      message: "Payment initiated",
      data: { paymentId: payment.id, transactionId },
    };
  } catch (error: any) {
    console.error("Error initiating payment:", error);
    return { success: false, message: error?.message || "Payment initiation failed" };
  }
}
