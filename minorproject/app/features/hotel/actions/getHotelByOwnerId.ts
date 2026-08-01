import { db } from "@/app/lib/db";
import { hotelsTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getHotelByOwnerId(userId: number) {
  try {
    const [hotel] = await db
      .select()
      .from(hotelsTable)
      .where(eq(hotelsTable.user_id, userId));

    if (!hotel) {
      return false;
    } else {
      return true;
    }
  } catch (error) {

    return {
        error : "Internal server error"
    }
  }
}
