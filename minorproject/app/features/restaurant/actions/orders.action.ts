"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, desc, eq, sql } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { restaurantOrdersTable, restaurantsTable } from "@/app/lib/db/schema";
import { ApiResponse } from "@/app/types/api";

async function requireRestaurantOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in");
  }

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.userId, Number(session.user.id)));

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return { session, restaurant };
}

// 1. Get All Orders & Reservations for Restaurant
export async function getRestaurantOrders() {
  try {
    const { restaurant } = await requireRestaurantOwner();

    const orders = await db
      .select()
      .from(restaurantOrdersTable)
      .where(eq(restaurantOrdersTable.restaurantId, restaurant.id))
      .orderBy(desc(restaurantOrdersTable.createdAt));

    return {
      success: true,
      data: orders,
    };
  } catch (error: any) {
    console.error("Error fetching restaurant orders:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch orders",
      data: [],
    };
  }
}

// 2. Update Order Status (Preparing / Served / Completed / Cancelled)
export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "preparing" | "served" | "completed" | "cancelled"
): Promise<ApiResponse<null>> {
  try {
    const { restaurant } = await requireRestaurantOwner();

    await db
      .update(restaurantOrdersTable)
      .set({ status })
      .where(
        and(
          eq(restaurantOrdersTable.id, orderId),
          eq(restaurantOrdersTable.restaurantId, restaurant.id)
        )
      );

    revalidatePath("/dashboard/restaurant/orders");
    revalidatePath("/dashboard/restaurant/analytics");

    return { success: true, message: `Order marked as ${status.toUpperCase()}` };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to update order" };
  }
}

// 3. Update Payment Status (Pending / Completed / Refunded)
export async function updateOrderPaymentStatus(
  orderId: number,
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
): Promise<ApiResponse<null>> {
  try {
    const { restaurant } = await requireRestaurantOwner();

    await db
      .update(restaurantOrdersTable)
      .set({ paymentStatus })
      .where(
        and(
          eq(restaurantOrdersTable.id, orderId),
          eq(restaurantOrdersTable.restaurantId, restaurant.id)
        )
      );

    revalidatePath("/dashboard/restaurant/orders");
    revalidatePath("/dashboard/restaurant/analytics");

    return { success: true, message: `Payment updated to ${paymentStatus.toUpperCase()}` };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to update payment" };
  }
}

// 4. Create New Order or Table Reservation
export async function createRestaurantOrder(data: {
  restaurantId: number;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  items: Array<{ name: string; price: number; qty: number }>;
  totalAmount: number;
  orderType?: "dine-in" | "takeaway" | "reservation";
  reservationDate?: string;
}): Promise<ApiResponse<{ orderId: number }>> {
  try {
    const session = await getServerSession(authOptions);

    const [newOrder] = await db
      .insert(restaurantOrdersTable)
      .values({
        restaurantId: data.restaurantId,
        userId: session?.user?.id ? Number(session.user.id) : null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        tableNumber: data.tableNumber || "T-1",
        itemsJson: JSON.stringify(data.items),
        totalAmount: data.totalAmount,
        orderType: data.orderType || "dine-in",
        status: "pending",
        paymentStatus: "pending",
        reservationDate: data.reservationDate,
      })
      .returning({ id: restaurantOrdersTable.id });

    revalidatePath("/dashboard/restaurant/orders");
    return {
      success: true,
      message: "Order placed successfully!",
      data: { orderId: newOrder.id },
    };
  } catch (error: any) {
    console.error("Error creating restaurant order:", error);
    return { success: false, message: error?.message || "Failed to place order" };
  }
}
