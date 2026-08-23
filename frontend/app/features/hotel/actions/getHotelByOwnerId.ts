import { db } from "@/app/lib/db";
import { hotelsTable } from "@/app/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getHotelByOwnerId(userId: number) {
  const [hotel] = await db
    .select()
    .from(hotelsTable)
    .where(eq(hotelsTable.userId, userId))
    .orderBy(desc(hotelsTable.id));

  return hotel ?? null;
}

export async function hasHotel(userId: number) {
  const [hotel] = await db
    .select({ id: hotelsTable.id })
    .from(hotelsTable)
    .where(eq(hotelsTable.userId, userId));

  return !!hotel;
}
