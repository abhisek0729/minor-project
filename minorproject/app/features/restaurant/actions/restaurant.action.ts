"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { restaurantsTable } from "@/app/lib/db/schema";
import { ApiResponse } from "@/app/types/api";

export async function updateRestaurantProfile(data: {
  name: string;
  description: string;
  establishedDate?: string;
  cuisine?: string;
  phoneNumber: string;
  location: string;
  restaurantImageUrl: string;
}): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (!data.name || !data.description || !data.phoneNumber || !data.location) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const [updated] = await db
      .update(restaurantsTable)
      .set({
        name: data.name.trim(),
        description: data.description.trim(),
        establishedDate: data.establishedDate ? data.establishedDate.trim() : null,
        cuisine: (data.cuisine || "Multi-Cuisine").trim(),
        phoneNumber: data.phoneNumber.trim(),
        location: data.location.trim(),
        restaurantImageUrl: data.restaurantImageUrl.trim(),
      })
      .where(eq(restaurantsTable.userId, Number(session.user.id)))
      .returning();

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/settings");

    return {
      success: true,
      message: "Restaurant profile updated successfully!",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error updating restaurant profile:", error);
    return {
      success: false,
      message: error?.message || "Failed to update restaurant profile",
    };
  }
}
