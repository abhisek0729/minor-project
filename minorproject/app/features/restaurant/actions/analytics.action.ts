"use server";

import { getServerSession } from "next-auth";
import { and, desc, eq, sql } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  menusTable,
  restaurantOrdersTable,
  restaurantsTable,
  reviewsTable,
} from "@/app/lib/db/schema";

export async function getRestaurantAnalytics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const [restaurant] = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.userId, Number(session.user.id)));

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const orders = await db
      .select()
      .from(restaurantOrdersTable)
      .where(eq(restaurantOrdersTable.restaurantId, restaurant.id))
      .orderBy(desc(restaurantOrdersTable.createdAt));

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "served");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
    const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;

    // Item sales breakdown
    const dishSales: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((order) => {
      try {
        const items = JSON.parse(order.itemsJson || "[]");
        items.forEach((item: any) => {
          if (!dishSales[item.name]) {
            dishSales[item.name] = { name: item.name, count: 0, revenue: 0 };
          }
          dishSales[item.name].count += item.qty || 1;
          dishSales[item.name].revenue += (item.price || 0) * (item.qty || 1);
        });
      } catch (e) {
        // ignore parse error
      }
    });

    const topDishes = Object.values(dishSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Reviews summary
    const [reviewStats] = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 5.0)`,
        reviewCount: sql<number>`CAST(COUNT(*) as integer)`,
      })
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.targetType, "restaurant"),
          eq(reviewsTable.targetId, restaurant.id)
        )
      );

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        activeOrders,
        averageOrderValue,
        avgRating: Number(reviewStats?.avgRating || 5).toFixed(1),
        reviewCount: reviewStats?.reviewCount || 0,
        topDishes,
        recentOrders: orders.slice(0, 6),
      },
    };
  } catch (error: any) {
    console.error("Error fetching restaurant analytics:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch analytics",
      data: {
        totalRevenue: 0,
        totalOrders: 0,
        activeOrders: 0,
        averageOrderValue: 0,
        avgRating: "5.0",
        reviewCount: 0,
        topDishes: [],
        recentOrders: [],
      },
    };
  }
}
