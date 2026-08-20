"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  bookingsTable,
  expensesTable,
  guideAvailabilityTable,
  guidesTable,
  hotelsTable,
  menusTable,
  packagesTable,
  restaurantsTable,
  roomsTable,
} from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface AgentProposalPayload {
  action_type: string;
  title: string;
  description: string;
  payload: Record<string, any>;
}

export async function executeAgentAction(proposal: AgentProposalPayload) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to execute platform actions.",
      };
    }

    const userId = Number(session.user.id);
    const { action_type, payload } = proposal;

    switch (action_type) {
      // 1. Log Expense Action (Travelers & Personal Tracker)
      case "LOG_EXPENSE": {
        const [expense] = await db
          .insert(expensesTable)
          .values({
            userId,
            name: payload.name || "Trip Expense",
            amount: Math.round(Number(payload.amount) || 0),
            location: payload.location || "Nepal",
            type: payload.type || "other",
          })
          .returning();

        revalidatePath("/dashboard");
        revalidatePath("/");

        return {
          success: true,
          message: `Expense "${expense.name}" (NPR ${expense.amount.toLocaleString()}) saved to your ledger.`,
          data: expense,
        };
      }

      // 2. Add Hotel Room Action (Hotel Owners)
      case "ADD_HOTEL_ROOM": {
        const [hotel] = await db
          .select()
          .from(hotelsTable)
          .where(eq(hotelsTable.userId, userId))
          .limit(1);

        if (!hotel) {
          return {
            success: false,
            message: "No registered hotel found for your account. Please complete hotel onboarding first.",
          };
        }

        const [room] = await db
          .insert(roomsTable)
          .values({
            hotelId: hotel.id,
            roomNumber: String(payload.room_number || "101"),
            roomType: payload.room_type || "single",
            pricePerNight: String(payload.price_per_night || "2500"),
            capacity: Number(payload.capacity) || 2,
            description: payload.description || "Comfortable room with modern amenities.",
            status: "available",
          })
          .returning();

        revalidatePath("/dashboard/hotels");
        revalidatePath("/dashboard/hotels/rooms");

        return {
          success: true,
          message: `Room #${room.roomNumber} (${room.roomType.toUpperCase()}) added to ${hotel.name} at NPR ${Number(room.pricePerNight).toLocaleString()}/night.`,
          data: room,
        };
      }

      // 3. Add Restaurant Dish Action (Restaurant Owners)
      case "ADD_RESTAURANT_DISH": {
        const [restaurant] = await db
          .select()
          .from(restaurantsTable)
          .where(eq(restaurantsTable.userId, userId))
          .limit(1);

        if (!restaurant) {
          return {
            success: false,
            message: "No registered restaurant found for your account. Please complete restaurant onboarding first.",
          };
        }

        const [dish] = await db
          .insert(menusTable)
          .values({
            restaurantId: restaurant.id,
            name: payload.name || "Special Dish",
            price: Math.round(Number(payload.price) || 0),
            description: payload.description || "Authentic freshly prepared local cuisine.",
            menusImageUrl: payload.menus_image_url || "/images/placeholder-dish.jpg",
            category: payload.category || "Main Course",
            isAvailable: true,
          })
          .returning();

        revalidatePath("/dashboard/restaurant");
        revalidatePath("/dashboard/restaurant/menu");

        return {
          success: true,
          message: `Dish "${dish.name}" added to ${restaurant.name} menu at NPR ${dish.price.toLocaleString()}.`,
          data: dish,
        };
      }

      // 4. Update Restaurant Hours & Status (Restaurant Owners)
      case "UPDATE_RESTAURANT_HOURS": {
        const [restaurant] = await db
          .select()
          .from(restaurantsTable)
          .where(eq(restaurantsTable.userId, userId))
          .limit(1);

        if (!restaurant) {
          return {
            success: false,
            message: "No registered restaurant found for your account.",
          };
        }

        const updateData: any = {};
        if (payload.opening_time) updateData.openingTime = payload.opening_time;
        if (payload.closing_time) updateData.closingTime = payload.closing_time;
        if (typeof payload.is_open === "boolean") updateData.isOpen = payload.is_open;

        await db
          .update(restaurantsTable)
          .set(updateData)
          .where(eq(restaurantsTable.id, restaurant.id));

        revalidatePath("/dashboard/restaurant");

        return {
          success: true,
          message: `Updated operating hours for ${restaurant.name} (${payload.opening_time || restaurant.openingTime} - ${payload.closing_time || restaurant.closingTime}).`,
        };
      }

      // 5. Create Tour Package Action (Tour Guides)
      case "CREATE_TOUR_PACKAGE": {
        const [guide] = await db
          .select()
          .from(guidesTable)
          .where(eq(guidesTable.userId, userId))
          .limit(1);

        if (!guide) {
          return {
            success: false,
            message: "No tour guide profile found for your account. Please complete guide onboarding first.",
          };
        }

        const [pkg] = await db
          .insert(packagesTable)
          .values({
            guideId: guide.id,
            title: payload.title || "Scenic Trekking Package",
            description: payload.description || "Guided adventure tour with certified local expert.",
            destination: payload.destination || "Nepal",
            durationDays: Number(payload.duration_days) || 1,
            price: Math.round(Number(payload.price) || 5000),
            maxGroupSize: Number(payload.max_group_size) || 10,
            itinerary: payload.itinerary || "Day 1: Sightseeing and scenic trek.",
            included: payload.included || "Guide service, safety gear, local permit assistance",
            excluded: payload.excluded || "Personal gear, tips, insurance",
            isPublished: true,
          })
          .returning();

        revalidatePath("/dashboard/guide");
        revalidatePath("/dashboard/guide/packages");

        return {
          success: true,
          message: `Tour Package "${pkg.title}" (${pkg.durationDays} Days, NPR ${pkg.price.toLocaleString()}) published successfully!`,
          data: pkg,
        };
      }

      // 6. Set Guide Availability (Tour Guides)
      case "SET_GUIDE_AVAILABILITY": {
        const [guide] = await db
          .select()
          .from(guidesTable)
          .where(eq(guidesTable.userId, userId))
          .limit(1);

        if (!guide) {
          return {
            success: false,
            message: "No tour guide profile found for your account.",
          };
        }

        const [avail] = await db
          .insert(guideAvailabilityTable)
          .values({
            guideId: guide.id,
            date: payload.date || new Date().toISOString().split("T")[0],
            isAvailable: payload.is_available ?? true,
            note: payload.note || "Available for guided tours",
          })
          .returning();

        revalidatePath("/dashboard/guide");
        revalidatePath("/dashboard/guide/availability");

        return {
          success: true,
          message: `Availability for ${avail.date} marked as ${avail.isAvailable ? "Available" : "Unavailable"}.`,
          data: avail,
        };
      }

      // 7. Create Traveler Booking Action
      case "CREATE_BOOKING": {
        const [booking] = await db
          .insert(bookingsTable)
          .values({
            userId,
            bookingType: payload.booking_type || "hotel",
            itemId: Number(payload.item_id) || 1,
            itemName: payload.item_name || "Travel Booking",
            checkInDate: payload.check_in_date || new Date().toISOString().split("T")[0],
            checkOutDate: payload.check_out_date || null,
            guests: Number(payload.guests) || 1,
            totalAmount: Math.round(Number(payload.total_amount) || 0),
            status: "pending",
            paymentStatus: "pending",
            specialRequests: payload.special_requests || "Booked via AI Travel Assistant",
          })
          .returning();

        revalidatePath("/dashboard");
        revalidatePath("/bookings");

        return {
          success: true,
          message: `Booking request for "${booking.itemName}" (NPR ${booking.totalAmount.toLocaleString()}) submitted!`,
          data: booking,
        };
      }

      default:
        return {
          success: false,
          message: `Unrecognized action type: ${action_type}`,
        };
    }
  } catch (error: any) {
    console.error("Execute Agent Action Error:", error);
    return {
      success: false,
      message: error?.message || "Failed to execute proposed action.",
    };
  }
}
