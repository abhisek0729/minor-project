import { db } from "@/app/lib/db";
import { bookingsTable } from "@/app/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getUserBookings(userId: number) {
  try {
    return await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.userId, userId))
      .orderBy(desc(bookingsTable.createdAt));
  } catch (error) {
    console.error("Failed to fetch user bookings:", error);
    return [];
  }
}
