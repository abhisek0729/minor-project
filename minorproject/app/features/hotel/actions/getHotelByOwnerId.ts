import { db } from "@/app/lib/db";
import { hotelsTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getHotelByOwnerId(userId: number) {
  const [hotel] = await db
    .select()
    .from(hotelsTable)
    .where(eq(hotelsTable.user_id, userId));

  return hotel ?? null;
}


export async function hasHotel(userId: number) {
  const [hotel] = await db
    .select({ id: hotelsTable.id })
    .from(hotelsTable)
    .where(eq(hotelsTable.user_id, userId));

  return !!hotel;
}
