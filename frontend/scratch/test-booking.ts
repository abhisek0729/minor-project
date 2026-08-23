import { db } from "../app/lib/db";
import { bookingsTable, usersTable } from "../app/lib/db/schema";

async function test() {
  try {
    const [firstUser] = await db.select().from(usersTable).limit(1);
    console.log("Found user:", firstUser?.id, firstUser?.email);

    const [newBooking] = await db
      .insert(bookingsTable)
      .values({
        userId: firstUser?.id || 1,
        bookingType: "hotel",
        itemId: 1,
        itemName: "Lakeview Haven",
        checkInDate: "2026-08-20",
        checkOutDate: null,
        guests: 1,
        totalAmount: 8400,
        status: "confirmed",
        paymentStatus: "completed",
        specialRequests: "Test booking",
      })
      .returning();

    console.log("SUCCESS! Created booking:", newBooking);
  } catch (err) {
    console.error("ERROR during booking:", err);
  }
}

test();
