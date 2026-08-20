"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { hotelsTable } from "@/app/lib/db/schema";

export async function updateHotelProfile(data: {
  name: string;
  description: string;
  phoneNumber: string;
  district: string;
  province: string;
  street: string;
  coverImageUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [hotel] = await db
      .select({ id: hotelsTable.id })
      .from(hotelsTable)
      .where(eq(hotelsTable.userId, Number(session.user.id)));

    if (!hotel) {
      return { success: false, message: "Hotel not found" };
    }

    await db
      .update(hotelsTable)
      .set({
        name: data.name,
        description: data.description,
        phoneNumber: data.phoneNumber,
        district: data.district,
        province: data.province,
        street: data.street,
        coverImageUrl: data.coverImageUrl || null,
      })
      .where(eq(hotelsTable.id, hotel.id));

    revalidatePath("/dashboard/hotels");
    revalidatePath("/dashboard/hotels/settings");

    return { success: true, message: "Hotel profile updated successfully!" };
  } catch (error: any) {
    console.error("Error updating hotel profile:", error);
    return { success: false, message: error?.message || "Failed to update hotel profile" };
  }
}
