"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { restaurantsTable } from "@/app/lib/db/schema";
import { ApiResponse } from "@/app/types/api";

export async function getRestaurantAvailability() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: null };
    }

    const [restaurant] = await db
      .select({
        id: restaurantsTable.id,
        name: restaurantsTable.name,
        isOpen: restaurantsTable.isOpen,
        openingTime: restaurantsTable.openingTime,
        closingTime: restaurantsTable.closingTime,
      })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      return { success: false, message: "Restaurant not found", data: null };
    }

    return {
      success: true,
      data: restaurant,
    };
  } catch (error: any) {
    console.error("Error getting availability:", error);
    return {
      success: false,
      message: error?.message || "Failed to get availability",
      data: null,
    };
  }
}

export async function toggleRestaurantOpenStatus(
  isOpen: boolean
): Promise<ApiResponse<boolean>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: false };
    }

    await db
      .update(restaurantsTable)
      .set({ isOpen })
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/availability");
    revalidatePath("/dashboard/restaurant/menu");

    return {
      success: true,
      message: `Restaurant is now ${isOpen ? "OPEN for orders" : "CLOSED"}!`,
      data: isOpen,
    };
  } catch (error: any) {
    console.error("Error toggling open status:", error);
    return {
      success: false,
      message: error?.message || "Failed to update restaurant status",
      data: false,
    };
  }
}

export async function updateRestaurantHours(data: {
  openingTime: string;
  closingTime: string;
}): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .update(restaurantsTable)
      .set({
        openingTime: data.openingTime,
        closingTime: data.closingTime,
      })
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/availability");

    return {
      success: true,
      message: "Operating hours updated successfully!",
    };
  } catch (error: any) {
    console.error("Error updating restaurant hours:", error);
    return {
      success: false,
      message: error?.message || "Failed to update operating hours",
    };
  }
}
