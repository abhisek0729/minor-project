import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { bookingsTable, paymentsTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyKhaltiPayment } from "@/app/lib/khalti";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pidx, bookingId, transaction_id } = body;

    if (!pidx) {
      return NextResponse.json(
        { verified: false, success: false, message: "Missing payment ID (pidx)" },
        { status: 400 }
      );
    }

    // Verify with Khalti / PayBridge
    const verification = await verifyKhaltiPayment(pidx);

    if (verification.status === "Completed") {
      let parsedBookingId = bookingId ? Number(bookingId) : null;

      // If bookingId was not provided, look it up in payments table via pidx
      if (!parsedBookingId && db) {
        try {
          const paymentRows = await db
            .select()
            .from(paymentsTable)
            .where(eq(paymentsTable.transactionId, pidx))
            .limit(1);
          if (paymentRows.length > 0 && paymentRows[0].bookingId) {
            parsedBookingId = paymentRows[0].bookingId;
          }
        } catch (findErr) {
          console.warn("Could not lookup bookingId from paymentsTable:", findErr);
        }
      }

      // Update booking status in database
      if (parsedBookingId && db) {
        try {
          await db
            .update(bookingsTable)
            .set({
              paymentStatus: "completed",
              status: "confirmed",
              updatedAt: new Date(),
            })
            .where(eq(bookingsTable.id, parsedBookingId));
        } catch (dbErr) {
          console.warn("Could not update booking status on verification:", dbErr);
        }
      }

      // Update payments table record
      if (db) {
        try {
          await db
            .update(paymentsTable)
            .set({
              status: "completed",
              transactionId: verification.transaction_id || transaction_id || pidx,
            })
            .where(eq(paymentsTable.transactionId, pidx));
        } catch (dbErr) {
          console.warn("Could not update payments table record:", dbErr);
        }
      }

      return NextResponse.json({
        verified: true,
        success: true,
        status: "Completed",
        bookingId: parsedBookingId,
        transaction_id: verification.transaction_id || pidx,
        amount: (verification.total_amount || 0) / 100, // converted back from paisa
        message: "Payment successfully verified and booking confirmed!",
      });
    } else {
      return NextResponse.json({
        verified: false,
        success: false,
        status: verification.status,
        message: `Payment status is ${verification.status}`,
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        verified: false,
        success: false,
        message: error.message || "Failed to verify transaction with gateway",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pidx = searchParams.get("pidx");
  const bookingId = searchParams.get("booking_id") || searchParams.get("bookingId");

  if (!pidx) {
    return NextResponse.json(
      { verified: false, success: false, message: "Missing pidx parameter" },
      { status: 400 }
    );
  }

  try {
    const verification = await verifyKhaltiPayment(pidx);
    const isCompleted = verification.status === "Completed";

    if (isCompleted && bookingId && db) {
      try {
        await db
          .update(bookingsTable)
          .set({
            paymentStatus: "completed",
            status: "confirmed",
            updatedAt: new Date(),
          })
          .where(eq(bookingsTable.id, Number(bookingId)));
      } catch (dbErr) {
        console.warn("Could not update booking status:", dbErr);
      }
    }

    return NextResponse.json({
      verified: isCompleted,
      success: isCompleted,
      status: verification.status,
      transaction_id: verification.transaction_id || pidx,
      amount: (verification.total_amount || 0) / 100,
    });
  } catch (error: any) {
    return NextResponse.json(
      { verified: false, error: error.message },
      { status: 500 }
    );
  }
}
