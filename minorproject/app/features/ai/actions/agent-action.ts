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
  roomImagesTable,
} from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserRoles } from "@/app/features/auth/services/roles.service";
import { updatePartnerApprovalStatus, deletePartnerWorkspaceAction } from "@/app/features/admin/actions/admin.action";
import { createDestinationAdminAction } from "@/app/features/admin/actions/destination-admin.action";

export interface AgentProposalPayload {
  action_type: string;
  title: string;
  description: string;
  payload: Record<string, unknown>;
}

// RBAC Guard helper for AI Agent actions
async function getAuthenticatedUserAndRoles() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("You must be signed in to execute platform actions.");
  }

  const userId = Number(session.user.id);
  const roles = session.user.roles || (await getUserRoles(userId));
  const roleNames = roles.map((r: { name: string }) => r.name);
  const isSuperAdmin = roles.some((r: { name: string; approvalStatus?: string }) => r.name === "admin" && r.approvalStatus === "approved");

  return { session, userId, roles, roleNames, isSuperAdmin };
}

export async function executeAgentAction(proposal: AgentProposalPayload) {
  try {
    const { userId, roleNames, isSuperAdmin } = await getAuthenticatedUserAndRoles();
    const { action_type, payload } = proposal;

    switch (action_type) {
      // ==========================================
      // 🛡️ SUPER ADMIN ACTIONS (Strict RBAC Guard)
      // ==========================================

      case "APPROVE_PARTNER": {
        if (!isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Super Admin role is required to approve partner applications.",
          };
        }

        const targetUserId = Number(payload.user_id || payload.userId);
        const roleName = String(payload.role_name || payload.roleName || "hotelOwner") as "hotelOwner" | "restaurantOwner" | "guide";

        if (!targetUserId) {
          return { success: false, message: "Invalid target user ID for partner approval." };
        }

        const res = await updatePartnerApprovalStatus(targetUserId, roleName, "approved");
        if (res.success) {
          revalidatePath("/dashboard/admin");
          revalidatePath("/dashboard/admin/approvals");
          revalidatePath("/dashboard/admin/companies");
          return {
            success: true,
            message: `Partner #${targetUserId} (${roleName}) successfully APPROVED by Super Admin.`,
          };
        }
        return res;
      }

      case "REJECT_PARTNER": {
        if (!isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Super Admin role is required to reject partner applications.",
          };
        }

        const targetUserId = Number(payload.user_id || payload.userId);
        const roleName = String(payload.role_name || payload.roleName || "hotelOwner") as "hotelOwner" | "restaurantOwner" | "guide";

        if (!targetUserId) {
          return { success: false, message: "Invalid target user ID." };
        }

        const res = await updatePartnerApprovalStatus(targetUserId, roleName, "rejected");
        if (res.success) {
          revalidatePath("/dashboard/admin");
          revalidatePath("/dashboard/admin/approvals");
          return {
            success: true,
            message: `Partner #${targetUserId} (${roleName}) rejected.`,
          };
        }
        return res;
      }

      case "CREATE_DESTINATION": {
        if (!isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Super Admin role is required to add official Nepal destinations.",
          };
        }

        const res = await createDestinationAdminAction({
          name: String(payload.name || "New Destination"),
          region: String(payload.region || "Gandaki Province"),
          category: String(payload.category || "Lakes & Mountains"),
          altitude: payload.altitude ? String(payload.altitude) : "1,400m",
          bestSeason: payload.best_season || payload.bestSeason ? String(payload.best_season || payload.bestSeason) : "Autumn & Spring",
          startingCost: payload.starting_cost || payload.startingCost ? String(payload.starting_cost || payload.startingCost) : "NPR 3,500/day",
          coverImage: payload.cover_image || payload.coverImage ? String(payload.cover_image || payload.coverImage) : "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
          shortDescription: payload.short_description || payload.shortDescription ? String(payload.short_description || payload.shortDescription) : `Discover the stunning natural beauty of ${payload.name}.`,
          historyAndCulture: payload.history_and_culture || payload.historyAndCulture ? String(payload.history_and_culture || payload.historyAndCulture) : `Cultural heritage and traditions in ${payload.region}.`,
          activities: Array.isArray(payload.activities) ? (payload.activities as string[]) : ["Sightseeing", "Photography", "Cultural Walking"],
          highlights: Array.isArray(payload.highlights) ? (payload.highlights as string[]) : ["Panoramic Views", "Local Hospitality", "Scenic Trails"],
        });

        return res;
      }

      case "DELETE_WORKSPACE": {
        if (!isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Super Admin role is required to delete workspaces.",
          };
        }

        return await deletePartnerWorkspaceAction(
          String(payload.type) as "hotel" | "restaurant" | "guide" | "agency",
          Number(payload.entity_id || payload.entityId),
          Number(payload.owner_id || payload.ownerId)
        );
      }

      // ==========================================
      // 🏨 HOTEL OWNER ACTIONS (RBAC Guard)
      // ==========================================

      case "ADD_HOTEL_ROOM": {
        if (!roleNames.includes("hotelOwner") && !isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: You must have an approved Hotel Owner workspace to add rooms.",
          };
        }

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

        // Query existing rooms for this hotel to prevent duplicate room numbers
        const existingRooms = await db
          .select({ roomNumber: roomsTable.roomNumber })
          .from(roomsTable)
          .where(eq(roomsTable.hotelId, hotel.id));

        const existingNumbers = new Set(existingRooms.map((r) => r.roomNumber.trim().toLowerCase()));
        let chosenRoomNumber = String(payload.room_number || "101").trim();

        // If duplicate room number, auto-increment to next available room number
        if (existingNumbers.has(chosenRoomNumber.toLowerCase())) {
          const baseNum = parseInt(chosenRoomNumber.replace(/\D/g, "")) || 101;
          let candidate = baseNum + 1;
          while (existingNumbers.has(String(candidate).toLowerCase())) {
            candidate += 1;
          }
          chosenRoomNumber = String(candidate);
        }

        const validTypes = ["single", "double", "twin", "family", "suite"] as const;
        let roomType = String(payload.room_type || "double").toLowerCase() as typeof validTypes[number];
        if (!validTypes.includes(roomType)) {
          roomType = "double";
        }

        const capacity = Number(payload.capacity) || (roomType === "single" ? 1 : roomType === "family" || roomType === "suite" ? 4 : 2);
        const pricePerNight = String(payload.price_per_night || "2500");
        const description = String(payload.description || `Comfortable ${roomType.toUpperCase()} room with modern amenities.`);

        const [room] = await db
          .insert(roomsTable)
          .values({
            hotelId: hotel.id,
            roomNumber: chosenRoomNumber,
            roomType,
            pricePerNight,
            capacity,
            description,
            status: "available",
          })
          .returning();

        // Save Cloudinary uploaded room image if present
        if (payload.image_url && String(payload.image_url).startsWith("http")) {
          await db.insert(roomImagesTable).values({
            roomId: room.id,
            imageUrl: String(payload.image_url),
            publicId: String(payload.image_public_id || `room_${room.id}_img`),
          });
        }

        revalidatePath("/dashboard/hotels");
        revalidatePath("/dashboard/hotels/rooms");

        return {
          success: true,
          message: `Room #${room.roomNumber} (${room.roomType.toUpperCase()}, Max ${room.capacity} Guests) added to ${hotel.name} at NPR ${Number(room.pricePerNight).toLocaleString()}/night.`,
          data: room,
        };
      }

      // ==========================================
      // 🍽️ RESTAURANT OWNER ACTIONS (RBAC Guard)
      // ==========================================

      case "ADD_RESTAURANT_DISH": {
        if (!roleNames.includes("restaurantOwner") && !isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: You must have an approved Restaurant Owner workspace to add menu items.",
          };
        }

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
            name: String(payload.name || "Special Dish"),
            price: Math.round(Number(payload.price) || 0),
            description: String(payload.description || "Authentic freshly prepared local cuisine."),
            menusImageUrl: String(payload.menus_image_url || "/images/placeholder-dish.jpg"),
            category: String(payload.category || "Main Course"),
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

      case "UPDATE_RESTAURANT_HOURS": {
        if (!roleNames.includes("restaurantOwner") && !isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Restaurant Owner privileges required.",
          };
        }

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

        const updateData: { openingTime?: string; closingTime?: string; isOpen?: boolean } = {};
        if (payload.opening_time) updateData.openingTime = String(payload.opening_time);
        if (payload.closing_time) updateData.closingTime = String(payload.closing_time);
        if (typeof payload.is_open === "boolean") updateData.isOpen = Boolean(payload.is_open);

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

      // ==========================================
      // 🧭 TOUR GUIDE ACTIONS (RBAC Guard)
      // ==========================================

      case "CREATE_TOUR_PACKAGE": {
        if (!roleNames.includes("guide") && !isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Certified Tour Guide workspace required to publish packages.",
          };
        }

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
            title: String(payload.title || "Scenic Trekking Package"),
            description: String(payload.description || "Guided adventure tour with certified local expert."),
            destination: String(payload.destination || "Nepal"),
            durationDays: Number(payload.duration_days) || 1,
            price: Math.round(Number(payload.price) || 5000),
            maxGroupSize: Number(payload.max_group_size) || 10,
            itinerary: String(payload.itinerary || "Day 1: Sightseeing and scenic trek."),
            included: String(payload.included || "Guide service, safety gear, local permit assistance"),
            excluded: String(payload.excluded || "Personal gear, tips, insurance"),
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

      case "SET_GUIDE_AVAILABILITY": {
        if (!roleNames.includes("guide") && !isSuperAdmin) {
          return {
            success: false,
            message: "Access Denied: Tour Guide privileges required.",
          };
        }

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
            date: String(payload.date || new Date().toISOString().split("T")[0]),
            isAvailable: Boolean(payload.is_available ?? true),
            note: String(payload.note || "Available for guided tours"),
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

      // ==========================================
      // 🧳 TRAVELER ACTIONS (Available for all authenticated users)
      // ==========================================

      case "LOG_EXPENSE": {
        const [expense] = await db
          .insert(expensesTable)
          .values({
            userId,
            name: String(payload.name || "Trip Expense"),
            amount: Math.round(Number(payload.amount) || 0),
            location: String(payload.location || "Nepal"),
            type: String(payload.type || "other"),
          })
          .returning();

        revalidatePath("/dashboard");
        revalidatePath("/trips");
        revalidatePath("/");

        return {
          success: true,
          message: `Expense "${expense.name}" (NPR ${expense.amount.toLocaleString()}) saved to your ledger.`,
          data: expense,
        };
      }

      case "CREATE_BOOKING": {
        const [booking] = await db
          .insert(bookingsTable)
          .values({
            userId,
            bookingType: String(payload.booking_type || "hotel") as "hotel" | "package" | "restaurant",
            itemId: Number(payload.item_id) || 1,
            itemName: String(payload.item_name || "Travel Booking"),
            checkInDate: String(payload.check_in_date || new Date().toISOString().split("T")[0]),
            checkOutDate: payload.check_out_date ? String(payload.check_out_date) : null,
            guests: Number(payload.guests) || 1,
            totalAmount: Math.round(Number(payload.total_amount) || 0),
            status: "pending",
            paymentStatus: "pending",
            specialRequests: String(payload.special_requests || "Booked via AI Travel Assistant"),
          })
          .returning();

        revalidatePath("/dashboard");
        revalidatePath("/bookings");
        revalidatePath("/trips");

        return {
          success: true,
          message: `Booking #${booking.id} created for "${booking.itemName}" (NPR ${booking.totalAmount.toLocaleString()}). Proceed to Khalti payment checkout to finalize reservation!`,
          data: booking,
        };
      }

      default:
        return {
          success: false,
          message: `Unrecognized action type: ${action_type}`,
        };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to execute proposed action.";
    console.error("Execute Agent Action Error:", error);
    return {
      success: false,
      message: errorMsg,
    };
  }
}
