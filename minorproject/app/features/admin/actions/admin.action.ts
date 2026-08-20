"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, desc, eq, sql } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  bookingsTable,
  guidesTable,
  hotelsTable,
  packagesTable,
  paymentsTable,
  restaurantOrdersTable,
  restaurantsTable,
  reviewsTable,
  rolesTable,
  travelProvidersTable,
  userRolesTable,
  usersTable,
} from "@/app/lib/db/schema";
import { getUserRoles } from "@/app/features/auth/services/roles.service";
import { ApiResponse } from "@/app/types/api";

// Helper: Ensure current user is an Admin
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userRoles =
    session.user.roles || (await getUserRoles(Number(session.user.id)));

  const adminRole = userRoles.find((r) => r.name === "admin");
  if (!adminRole || adminRole.approvalStatus !== "approved") {
    throw new Error("Forbidden: Approved Admin access required");
  }

  return session;
}

// 1. Get Platform Statistics
export async function getAdminPlatformStats() {
  try {
    await requireAdmin();

    const [userCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(usersTable);

    const [restaurantCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(restaurantsTable);

    const [hotelCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(hotelsTable);

    // Pending Restaurants count
    const [pendingRestaurants] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(rolesTable.name, "restaurantOwner"),
          eq(userRolesTable.approvalStatus, "pending")
        )
      );

    // Pending Hotels count
    const [pendingHotels] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(rolesTable.name, "hotelOwner"),
          eq(userRolesTable.approvalStatus, "pending")
        )
      );

    return {
      success: true,
      data: {
        totalUsers: userCount?.count || 0,
        totalRestaurants: restaurantCount?.count || 0,
        totalHotels: hotelCount?.count || 0,
        pendingRestaurants: pendingRestaurants?.count || 0,
        pendingHotels: pendingHotels?.count || 0,
        totalPending: (pendingRestaurants?.count || 0) + (pendingHotels?.count || 0),
      },
    };
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch platform stats",
      data: {
        totalUsers: 0,
        totalRestaurants: 0,
        totalHotels: 0,
        pendingRestaurants: 0,
        pendingHotels: 0,
        totalPending: 0,
      },
    };
  }
}

// 2. Get All Pending Approvals (Restaurants & Hotels)
export async function getPendingApprovals() {
  try {
    await requireAdmin();

    // Fetch Pending Restaurants
    const pendingRestaurants = await db
      .select({
        userId: userRolesTable.userId,
        roleId: userRolesTable.roleId,
        approvalStatus: userRolesTable.approvalStatus,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        userCreatedAt: usersTable.createdAt,
        businessId: restaurantsTable.id,
        businessName: restaurantsTable.name,
        businessDescription: restaurantsTable.description,
        businessImage: restaurantsTable.restaurantImageUrl,
        businessLocation: restaurantsTable.location,
        businessPhone: restaurantsTable.phoneNumber,
        cuisine: restaurantsTable.cuisine,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .innerJoin(usersTable, eq(userRolesTable.userId, usersTable.id))
      .leftJoin(restaurantsTable, eq(usersTable.id, restaurantsTable.userId))
      .where(
        and(
          eq(rolesTable.name, "restaurantOwner"),
          eq(userRolesTable.approvalStatus, "pending")
        )
      )
      .orderBy(desc(usersTable.createdAt));

    // Fetch Pending Hotels
    const pendingHotels = await db
      .select({
        userId: userRolesTable.userId,
        roleId: userRolesTable.roleId,
        approvalStatus: userRolesTable.approvalStatus,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        userCreatedAt: usersTable.createdAt,
        businessId: hotelsTable.id,
        businessName: hotelsTable.name,
        businessDescription: hotelsTable.description,
        businessImage: hotelsTable.coverImageUrl,
        businessLocation: sql<string>`concat(${hotelsTable.street}, ', ', ${hotelsTable.district}, ', ', ${hotelsTable.province})`,
        businessPhone: hotelsTable.phoneNumber,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .innerJoin(usersTable, eq(userRolesTable.userId, usersTable.id))
      .leftJoin(hotelsTable, eq(usersTable.id, hotelsTable.userId))
      .where(
        and(
          eq(rolesTable.name, "hotelOwner"),
          eq(userRolesTable.approvalStatus, "pending")
        )
      )
      .orderBy(desc(usersTable.createdAt));

    return {
      success: true,
      data: {
        restaurants: pendingRestaurants.map((r) => ({ ...r, type: "restaurant" as const })),
        hotels: pendingHotels.map((h) => ({ ...h, type: "hotel" as const })),
      },
    };
  } catch (error: any) {
    console.error("Error fetching pending approvals:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch pending requests",
      data: {
        restaurants: [],
        hotels: [],
      },
    };
  }
}

// 3. Update Partner Approval Status (Approve / Reject / Suspend)
export async function updatePartnerApprovalStatus(
  userId: number,
  roleName: "restaurantOwner" | "hotelOwner" | "guide",
  status: "approved" | "rejected" | "suspended"
): Promise<ApiResponse<null>> {
  try {
    await requireAdmin();

    const [role] = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, roleName));

    if (!role) {
      return { success: false, message: "Role not found" };
    }

    await db
      .update(userRolesTable)
      .set({ approvalStatus: status })
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(userRolesTable.roleId, role.id)
        )
      );

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/approvals");
    revalidatePath("/dashboard/admin/restaurants");
    revalidatePath("/dashboard/admin/hotels");
    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/hotels");
    revalidatePath("/restaurants");
    revalidatePath("/hotels");

    return {
      success: true,
      message: `Partner request has been ${status.toUpperCase()} successfully!`,
    };
  } catch (error: any) {
    console.error("Error updating partner approval status:", error);
    return {
      success: false,
      message: error?.message || "Failed to update approval status",
    };
  }
}

// 4. Get All Registered Restaurants for Admin
export async function getAllRestaurantsAdmin() {
  try {
    await requireAdmin();

    const restaurants = await db
      .select({
        id: restaurantsTable.id,
        name: restaurantsTable.name,
        description: restaurantsTable.description,
        cuisine: restaurantsTable.cuisine,
        phoneNumber: restaurantsTable.phoneNumber,
        location: restaurantsTable.location,
        restaurantImageUrl: restaurantsTable.restaurantImageUrl,
        isOpen: restaurantsTable.isOpen,
        openingTime: restaurantsTable.openingTime,
        closingTime: restaurantsTable.closingTime,
        ownerId: usersTable.id,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        approvalStatus: userRolesTable.approvalStatus,
      })
      .from(restaurantsTable)
      .innerJoin(usersTable, eq(restaurantsTable.userId, usersTable.id))
      .innerJoin(userRolesTable, eq(userRolesTable.userId, usersTable.id))
      .innerJoin(
        rolesTable,
        and(
          eq(userRolesTable.roleId, rolesTable.id),
          eq(rolesTable.name, "restaurantOwner")
        )
      )
      .orderBy(desc(restaurantsTable.id));

    return {
      success: true,
      data: restaurants,
    };
  } catch (error: any) {
    console.error("Error fetching admin restaurants:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch restaurants",
      data: [],
    };
  }
}

// 5. Get All Registered Hotels for Admin
export async function getAllHotelsAdmin() {
  try {
    await requireAdmin();

    const hotels = await db
      .select({
        id: hotelsTable.id,
        name: hotelsTable.name,
        description: hotelsTable.description,
        phoneNumber: hotelsTable.phoneNumber,
        province: hotelsTable.province,
        district: hotelsTable.district,
        municipality: hotelsTable.municipality,
        coverImageUrl: hotelsTable.coverImageUrl,
        ownerId: usersTable.id,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        approvalStatus: userRolesTable.approvalStatus,
      })
      .from(hotelsTable)
      .innerJoin(usersTable, eq(hotelsTable.userId, usersTable.id))
      .innerJoin(userRolesTable, eq(userRolesTable.userId, usersTable.id))
      .innerJoin(
        rolesTable,
        and(
          eq(userRolesTable.roleId, rolesTable.id),
          eq(rolesTable.name, "hotelOwner")
        )
      )
      .orderBy(desc(hotelsTable.id));

    return {
      success: true,
      data: hotels,
    };
  } catch (error: any) {
    console.error("Error fetching admin hotels:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch hotels",
      data: [],
    };
  }
}

// 6. Get All Users for Admin
export async function getAllUsersAdmin() {
  try {
    await requireAdmin();

    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        isVerified: usersTable.isVerified,
        provider: usersTable.provider,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch users",
      data: [],
    };
  }
}

// 7. Get All Guides for Admin
export async function getAllGuidesAdmin() {
  try {
    await requireAdmin();

    const guides = await db
      .select({
        id: guidesTable.id,
        userId: guidesTable.userId,
        name: guidesTable.name,
        description: guidesTable.description,
        location: guidesTable.location,
        phoneNumber: guidesTable.phoneNumber,
        guideImageUrl: guidesTable.guideImageUrl,
        experienceYears: guidesTable.experienceYears,
        languages: guidesTable.languages,
        dailyRate: guidesTable.dailyRate,
        isAvailable: guidesTable.isAvailable,
        licenseNumber: guidesTable.licenseNumber,
        createdAt: guidesTable.createdAt,
        ownerEmail: usersTable.email,
        approvalStatus: userRolesTable.approvalStatus,
      })
      .from(guidesTable)
      .innerJoin(usersTable, eq(guidesTable.userId, usersTable.id))
      .innerJoin(userRolesTable, eq(userRolesTable.userId, usersTable.id))
      .innerJoin(
        rolesTable,
        and(
          eq(userRolesTable.roleId, rolesTable.id),
          eq(rolesTable.name, "guide")
        )
      )
      .orderBy(desc(guidesTable.id));

    return { success: true, data: guides };
  } catch (error: any) {
    console.error("Error fetching admin guides:", error);
    return { success: false, message: error?.message || "Failed to fetch guides", data: [] };
  }
}

// 8. Get All Travel Providers for Admin
export async function getAllTravelProvidersAdmin() {
  try {
    await requireAdmin();

    const providers = await db
      .select({
        id: travelProvidersTable.id,
        userId: travelProvidersTable.userId,
        companyName: travelProvidersTable.companyName,
        businessType: travelProvidersTable.businessType,
        licenseNumber: travelProvidersTable.licenseNumber,
        contactEmail: travelProvidersTable.contactEmail,
        contactPhone: travelProvidersTable.contactPhone,
        address: travelProvidersTable.address,
        description: travelProvidersTable.description,
        logoUrl: travelProvidersTable.logoUrl,
        approvalStatus: travelProvidersTable.approvalStatus,
        createdAt: travelProvidersTable.createdAt,
      })
      .from(travelProvidersTable)
      .orderBy(desc(travelProvidersTable.id));

    return { success: true, data: providers };
  } catch (error: any) {
    console.error("Error fetching admin travel providers:", error);
    return { success: false, message: error?.message || "Failed to fetch travel providers", data: [] };
  }
}

// 9. Update Travel Provider Approval
export async function updateTravelProviderApproval(
  providerId: number,
  status: "approved" | "rejected" | "suspended"
): Promise<ApiResponse<null>> {
  try {
    await requireAdmin();

    await db
      .update(travelProvidersTable)
      .set({ approvalStatus: status })
      .where(eq(travelProvidersTable.id, providerId));

    revalidatePath("/dashboard/admin/providers");
    return { success: true, message: `Travel provider marked as ${status.toUpperCase()}` };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to update provider" };
  }
}

// 10. Platform Revenue & Booking Analytics
export async function getAdminRevenueAnalytics() {
  try {
    await requireAdmin();

    // 1. All Bookings
    const bookings = await db
      .select({
        id: bookingsTable.id,
        bookingType: bookingsTable.bookingType,
        itemName: bookingsTable.itemName,
        totalAmount: bookingsTable.totalAmount,
        status: bookingsTable.status,
        paymentStatus: bookingsTable.paymentStatus,
        createdAt: bookingsTable.createdAt,
        customerName: usersTable.name,
      })
      .from(bookingsTable)
      .innerJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
      .orderBy(desc(bookingsTable.createdAt));

    // 2. All Restaurant Orders
    const restaurantOrders = await db
      .select({
        id: restaurantOrdersTable.id,
        totalAmount: restaurantOrdersTable.totalAmount,
        status: restaurantOrdersTable.status,
        paymentStatus: restaurantOrdersTable.paymentStatus,
        createdAt: restaurantOrdersTable.createdAt,
      })
      .from(restaurantOrdersTable);

    // Sum calculations
    const totalBookingVolume = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const confirmedBookingVolume = bookings
      .filter((b) => b.paymentStatus === "completed" || b.status === "confirmed")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalRestaurantVolume = restaurantOrders
      .filter((o) => o.status === "completed" || o.paymentStatus === "completed")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const grossPlatformVolume = confirmedBookingVolume + totalRestaurantVolume;
    const platformCommission = Math.round(grossPlatformVolume * 0.10); // 10% Platform fee

    const bookingStatusCounts = {
      confirmed: bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };

    return {
      success: true,
      data: {
        grossPlatformVolume,
        platformCommission,
        confirmedBookingVolume,
        totalRestaurantVolume,
        totalBookings: bookings.length,
        bookingStatusCounts,
        recentBookings: bookings.slice(0, 8),
      },
    };
  } catch (error: any) {
    console.error("Error fetching admin revenue analytics:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch analytics",
      data: {
        grossPlatformVolume: 0,
        platformCommission: 0,
        confirmedBookingVolume: 0,
        totalRestaurantVolume: 0,
        totalBookings: 0,
        bookingStatusCounts: { confirmed: 0, pending: 0, cancelled: 0 },
        recentBookings: [],
      },
    };
  }
}

