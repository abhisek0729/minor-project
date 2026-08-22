"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, desc, eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { menusTable, restaurantsTable } from "@/app/lib/db/schema";
import { menuItemSchema, MenuItemInput } from "../schemas/menu.schema";
import { ApiResponse } from "@/app/types/api";

export async function getMenuItems() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    const [restaurant] = await db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      return { success: false, message: "Restaurant not found", data: [] };
    }

    const items = await db
      .select()
      .from(menusTable)
      .where(eq(menusTable.restaurantId, restaurant.id))
      .orderBy(desc(menusTable.createdAt));

    return {
      success: true,
      data: items,
    };
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch menu items",
      data: [],
    };
  }
}

export async function createMenuItem(
  data: MenuItemInput
): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [restaurant] = await db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      return { success: false, message: "Restaurant not found" };
    }

    const validated = menuItemSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation error",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const [newItem] = await db
      .insert(menusTable)
      .values({
        restaurantId: restaurant.id,
        name: validated.data.name,
        description: validated.data.description,
        price: validated.data.price,
        category: validated.data.category,
        menusImageUrl: validated.data.menusImageUrl,
        isAvailable: validated.data.isAvailable ?? true,
      })
      .returning();

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/menu");

    return {
      success: true,
      message: "Menu item added successfully!",
      data: newItem,
    };
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    return {
      success: false,
      message: error?.message || "Failed to create menu item",
    };
  }
}

export async function updateMenuItem(
  id: number,
  data: MenuItemInput
): Promise<ApiResponse<any>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [restaurant] = await db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      return { success: false, message: "Restaurant not found" };
    }

    // Verify ownership of the menu item
    const [existingItem] = await db
      .select({ id: menusTable.id })
      .from(menusTable)
      .where(
        and(
          eq(menusTable.id, id),
          eq(menusTable.restaurantId, restaurant.id)
        )
      );

    if (!existingItem) {
      return { success: false, message: "Menu item not found or unauthorized" };
    }

    const validated = menuItemSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation error",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const [updated] = await db
      .update(menusTable)
      .set({
        name: validated.data.name,
        description: validated.data.description,
        price: validated.data.price,
        category: validated.data.category,
        menusImageUrl: validated.data.menusImageUrl,
        isAvailable: validated.data.isAvailable,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(menusTable.id, id),
          eq(menusTable.restaurantId, restaurant.id)
        )
      )
      .returning();

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/menu");

    return {
      success: true,
      message: "Menu item updated successfully!",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    return {
      success: false,
      message: error?.message || "Failed to update menu item",
    };
  }
}

export async function deleteMenuItem(id: number): Promise<ApiResponse<null>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [restaurant] = await db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      return { success: false, message: "Restaurant not found" };
    }

    await db
      .delete(menusTable)
      .where(
        and(
          eq(menusTable.id, id),
          eq(menusTable.restaurantId, restaurant.id)
        )
      );

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/menu");

    return {
      success: true,
      message: "Menu item removed successfully!",
    };
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    return {
      success: false,
      message: error?.message || "Failed to delete menu item",
    };
  }
}

export async function toggleMenuItemAvailability(
  id: number,
  isAvailable: boolean
): Promise<ApiResponse<null>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [restaurant] = await db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      return { success: false, message: "Restaurant not found" };
    }

    await db
      .update(menusTable)
      .set({
        isAvailable,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(menusTable.id, id),
          eq(menusTable.restaurantId, restaurant.id)
        )
      );

    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/restaurant/menu");

    return {
      success: true,
      message: `Item marked as ${isAvailable ? "Available" : "Sold Out"}`,
    };
  } catch (error: any) {
    console.error("Error toggling item availability:", error);
    return {
      success: false,
      message: error?.message || "Failed to update availability",
    };
  }
}
