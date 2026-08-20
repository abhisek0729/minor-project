import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { bookingsTable, paymentsTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { BASE_URL, initiateKhaltiPayment } from "@/app/lib/khalti";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      bookingId,
      amount, // Amount in NPR
      itemName,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    let userId: number | null = session?.user?.id ? Number(session.user.id) : null;
    if (!userId && db) {
      try {
        const firstUser = await db.query.usersTable?.findFirst?.() || (await db.select().from(bookingsTable).limit(1))[0];
        if (firstUser && 'userId' in firstUser) userId = (firstUser as any).userId;
      } catch {}
    }
    const orderId = bookingId ? `BK-${bookingId}-${Date.now()}` : `ORDER-${Date.now()}`;
    const orderName = itemName || "TravelNepal Trip Reservation";

    // Khalti expects amount in paisa (NPR 1 = 100 paisa)
    // Minimum amount is NPR 10 (1000 paisa)
    const amountInPaisa = Math.max(1000, Math.round(Number(amount) * 100));

    const returnUrl = `${BASE_URL.replace(/\/$/, "")}/payment/success?booking_id=${bookingId || ""}`;
    const websiteUrl = BASE_URL;

    // Call Khalti / PayBridge
    const payment = await initiateKhaltiPayment({
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: orderName,
      customer_info: {
        name: customerName || session?.user?.name || "Traveler",
        email: customerEmail || session?.user?.email || "traveler@travelnepal.com",
        phone: customerPhone || "9800000000",
      },
    });

    // Record in payments table
    try {
      if (db && userId) {
        await db.insert(paymentsTable).values({
          bookingId: bookingId ? Number(bookingId) : null,
          userId,
          amount: Number(amount),
          paymentMethod: "khalti",
          transactionId: payment.pidx,
          status: "pending",
          paymentData: JSON.stringify({
            pidx: payment.pidx,
            orderId,
            orderName,
            payment_url: payment.payment_url,
          }),
        });
      }
    } catch (dbErr) {
      console.warn("Could not log payment initiation in DB:", dbErr);
    }

    return NextResponse.json({
      success: true,
      pidx: payment.pidx,
      payment_url: payment.payment_url,
      bookingId,
      orderId,
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initiate payment gateway",
      },
      { status: 500 }
    );
  }
}
