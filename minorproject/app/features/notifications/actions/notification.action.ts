"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  bookingsTable,
  expensesTable,
  guidesTable,
  hotelsTable,
  menusTable,
  packagesTable,
  restaurantOrdersTable,
  restaurantsTable,
  roomsTable,
  userRolesTable,
} from "@/app/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getUserRoles } from "@/app/features/auth/services/roles.service";

export interface WorkspaceNotification {
  id: string;
  title: string;
  description: string;
  category: "booking" | "expense" | "hotel" | "restaurant" | "guide" | "system";
  timestamp: string;
  createdAt: string;
  urgency?: "normal" | "high";
  read: boolean;
  link?: string;
}

function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Just now";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toIsoString(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export async function getLiveWorkspaceNotifications(): Promise<WorkspaceNotification[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return [];
    }

    const userId = Number(session.user.id);
    const userRoles = session.user.roles || (await getUserRoles(userId));
    const notifications: WorkspaceNotification[] = [];

    // ==========================================
    // 1. HOTEL OWNER WORKSPACE NOTIFICATIONS
    // ==========================================
    const hotelRole = userRoles.find((r: { name: string }) => r.name === "hotelOwner");
    if (hotelRole) {
      const status = hotelRole.approvalStatus || "pending";
      const [hotel] = await db
        .select()
        .from(hotelsTable)
        .where(eq(hotelsTable.userId, userId))
        .limit(1);

      if (hotel) {
        if (status === "pending") {
          notifications.push({
            id: `hotel-status-${hotel.id}`,
            title: "Hotel Verification Under Review",
            description: `Your registration for "${hotel.name}" in ${hotel.municipality}, ${hotel.district} is awaiting Super Admin verification.`,
            category: "hotel",
            timestamp: formatRelativeTime(hotel.createdAt),
            createdAt: toIsoString(hotel.createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/hotels/pending",
          });
        } else if (status === "approved") {
          notifications.push({
            id: `hotel-status-${hotel.id}`,
            title: "Hotel Workspace Verified 🎉",
            description: `"${hotel.name}" is approved and publicly listed across the TravelNepal discovery catalog.`,
            category: "hotel",
            timestamp: formatRelativeTime(hotel.updatedAt || hotel.createdAt),
            createdAt: toIsoString(hotel.updatedAt || hotel.createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/hotels",
          });
        }

        // Real Rooms Activity
        const rooms = await db
          .select()
          .from(roomsTable)
          .where(eq(roomsTable.hotelId, hotel.id))
          .orderBy(desc(roomsTable.createdAt))
          .limit(5);

        if (rooms.length === 0) {
          notifications.push({
            id: `hotel-empty-rooms-${hotel.id}`,
            title: "Action Needed: Add Room Inventory",
            description: `"${hotel.name}" has 0 rooms listed. Add your first room unit so travelers can book stays.`,
            category: "hotel",
            timestamp: "Action Required",
            createdAt: toIsoString(hotel.createdAt),
            urgency: "high",
            read: false,
            link: "/dashboard/hotels/rooms/new",
          });
        } else {
          notifications.push({
            id: `hotel-rooms-summary-${hotel.id}`,
            title: `Room Catalog Active (${rooms.length} Units)`,
            description: `Latest: Room #${rooms[0].roomNumber} (${rooms[0].roomType.toUpperCase()}) listed at NPR ${Number(rooms[0].pricePerNight).toLocaleString()}/night.`,
            category: "hotel",
            timestamp: formatRelativeTime(rooms[0].createdAt),
            createdAt: toIsoString(rooms[0].createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/hotels/rooms",
          });
        }

        // Real Hotel Bookings
        const hotelBookings = await db
          .select()
          .from(bookingsTable)
          .where(eq(bookingsTable.itemId, hotel.id))
          .orderBy(desc(bookingsTable.createdAt))
          .limit(3);

        for (const b of hotelBookings) {
          notifications.push({
            id: `hotel-booking-${b.id}`,
            title: `Guest Reservation #${b.id}`,
            description: `${b.guests} guest(s) booked for NPR ${b.totalAmount.toLocaleString()} (${b.status.toUpperCase()}). Payment: ${b.paymentStatus}.`,
            category: "booking",
            timestamp: formatRelativeTime(b.createdAt),
            createdAt: toIsoString(b.createdAt),
            urgency: b.status === "pending" ? "high" : "normal",
            read: false,
            link: "/dashboard/hotels",
          });
        }
      }
    }

    // ==========================================
    // 2. RESTAURANT OWNER WORKSPACE NOTIFICATIONS
    // ==========================================
    const restRole = userRoles.find((r: { name: string }) => r.name === "restaurantOwner");
    if (restRole) {
      const status = restRole.approvalStatus || "pending";
      const [rest] = await db
        .select()
        .from(restaurantsTable)
        .where(eq(restaurantsTable.userId, userId))
        .limit(1);

      if (rest) {
        if (status === "pending") {
          notifications.push({
            id: `rest-status-${rest.id}`,
            title: "Restaurant Verification In Review",
            description: `Registration for "${rest.name}" is being verified. Operating hours: ${rest.openingTime || "09:00 AM"} - ${rest.closingTime || "10:00 PM"}.`,
            category: "restaurant",
            timestamp: formatRelativeTime(rest.createdAt),
            createdAt: toIsoString(rest.createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/restaurant/pending",
          });
        } else if (status === "approved") {
          notifications.push({
            id: `rest-status-${rest.id}`,
            title: "Restaurant Store Live 🍽️",
            description: `"${rest.name}" is verified. Store is currently ${rest.isOpen !== false ? "OPEN" : "CLOSED"}.`,
            category: "restaurant",
            timestamp: formatRelativeTime(rest.updatedAt || rest.createdAt),
            createdAt: toIsoString(rest.updatedAt || rest.createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/restaurant",
          });
        }

        // Menus
        const menus = await db
          .select()
          .from(menusTable)
          .where(eq(menusTable.restaurantId, rest.id))
          .orderBy(desc(menusTable.createdAt))
          .limit(5);

        if (menus.length === 0) {
          notifications.push({
            id: `rest-empty-menu-${rest.id}`,
            title: "Menu Setup: Add Dishes",
            description: `"${rest.name}" has no menu items yet. Add food items to enable digital menus for diners.`,
            category: "restaurant",
            timestamp: "Setup Required",
            createdAt: toIsoString(rest.createdAt),
            urgency: "high",
            read: false,
            link: "/dashboard/restaurant/menu",
          });
        } else {
          notifications.push({
            id: `rest-menus-active-${rest.id}`,
            title: `Digital Menu Active (${menus.length} Dishes)`,
            description: `Latest Dish: "${menus[0].name}" listed at NPR ${menus[0].price.toLocaleString()}.`,
            category: "restaurant",
            timestamp: formatRelativeTime(menus[0].createdAt),
            createdAt: toIsoString(menus[0].createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/restaurant/menu",
          });
        }

        // Orders
        const orders = await db
          .select()
          .from(restaurantOrdersTable)
          .where(eq(restaurantOrdersTable.restaurantId, rest.id))
          .orderBy(desc(restaurantOrdersTable.createdAt))
          .limit(3);

        for (const ord of orders) {
          notifications.push({
            id: `rest-order-${ord.id}`,
            title: `Dining Order #${ord.id}`,
            description: `Customer: ${ord.customerName} (${ord.orderType || "dine-in"}) • Total: NPR ${ord.totalAmount.toLocaleString()} (${ord.status}).`,
            category: "restaurant",
            timestamp: formatRelativeTime(ord.createdAt),
            createdAt: toIsoString(ord.createdAt),
            urgency: ord.status === "pending" ? "high" : "normal",
            read: false,
            link: "/dashboard/restaurant/orders",
          });
        }
      }
    }

    // ==========================================
    // 3. TOUR GUIDE WORKSPACE NOTIFICATIONS
    // ==========================================
    const guideRole = userRoles.find((r: { name: string }) => r.name === "guide");
    if (guideRole) {
      const status = guideRole.approvalStatus || "pending";
      const [guide] = await db
        .select()
        .from(guidesTable)
        .where(eq(guidesTable.userId, userId))
        .limit(1);

      if (guide) {
        if (status === "pending") {
          notifications.push({
            id: `guide-status-${guide.id}`,
            title: "Tour Guide Credentials In Review",
            description: `Your guide profile and license details are under administrator review.`,
            category: "guide",
            timestamp: formatRelativeTime(guide.createdAt),
            createdAt: toIsoString(guide.createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/guide/pending",
          });
        }

        const pkgs = await db
          .select()
          .from(packagesTable)
          .where(eq(packagesTable.guideId, guide.id))
          .orderBy(desc(packagesTable.createdAt))
          .limit(3);

        if (pkgs.length === 0) {
          notifications.push({
            id: `guide-no-packages-${guide.id}`,
            title: "Publish First Trekking Tour",
            description: "Create your first scenic tour package to start receiving traveler trek bookings.",
            category: "guide",
            timestamp: "Setup",
            createdAt: toIsoString(guide.createdAt),
            urgency: "high",
            read: false,
            link: "/dashboard/guide/packages",
          });
        } else {
          notifications.push({
            id: `guide-pkgs-active-${guide.id}`,
            title: `Trekking Packages Live (${pkgs.length})`,
            description: `Latest Tour: "${pkgs[0].title}" (${pkgs[0].durationDays} Days, NPR ${pkgs[0].price.toLocaleString()}).`,
            category: "guide",
            timestamp: formatRelativeTime(pkgs[0].createdAt),
            createdAt: toIsoString(pkgs[0].createdAt),
            urgency: "normal",
            read: false,
            link: "/dashboard/guide/packages",
          });
        }
      }
    }

    // ==========================================
    // 4. SUPER ADMIN SYSTEM NOTIFICATIONS
    // ==========================================
    const adminRole = userRoles.find((r: { name: string }) => r.name === "admin");
    if (adminRole) {
      const pendingRoles = await db
        .select()
        .from(userRolesTable)
        .where(eq(userRolesTable.approvalStatus, "pending"));

      if (pendingRoles.length > 0) {
        notifications.push({
          id: "admin-pending-reviews",
          title: "Partner Verification Requests",
          description: `${pendingRoles.length} partner application(s) are awaiting verification in the Super Admin console.`,
          category: "system",
          timestamp: formatRelativeTime(pendingRoles[0].createdAt),
          createdAt: toIsoString(pendingRoles[0].createdAt),
          urgency: "high",
          read: false,
          link: "/dashboard/admin/approvals",
        });
      }
    }

    // ==========================================
    // 5. TRAVELER BOOKINGS & EXPENSES
    // ==========================================
    const userBookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.userId, userId))
      .orderBy(desc(bookingsTable.createdAt))
      .limit(3);

    for (const b of userBookings) {
      notifications.push({
        id: `user-booking-${b.id}`,
        title: `Booking: ${b.itemName || "Travel Reservation"}`,
        description: `Reserved for ${b.guests} guest(s) at NPR ${b.totalAmount.toLocaleString()}. Status: ${b.status.toUpperCase()}.`,
        category: "booking",
        timestamp: formatRelativeTime(b.createdAt),
        createdAt: toIsoString(b.createdAt),
        urgency: b.status === "pending" ? "high" : "normal",
        read: false,
        link: "/dashboard",
      });
    }

    const userExpenses = await db
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, userId))
      .orderBy(desc(expensesTable.createdAt))
      .limit(3);

    for (const exp of userExpenses) {
      notifications.push({
        id: `user-expense-${exp.id}`,
        title: `Expense Logged: NPR ${exp.amount.toLocaleString()}`,
        description: `Recorded "${exp.name}" (${exp.type}) in ${exp.location}.`,
        category: "expense",
        timestamp: formatRelativeTime(exp.createdAt),
        createdAt: toIsoString(exp.createdAt),
        urgency: "normal",
        read: true,
        link: "/dashboard",
      });
    }

    // Sort notifications in chronological order (latest / most recent first)
    notifications.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return notifications;
  } catch (error) {
    console.error("Failed to get workspace notifications:", error);
    return [];
  }
}
