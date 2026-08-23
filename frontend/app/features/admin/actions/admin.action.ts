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

    const [guideCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(guidesTable);

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

    // Pending Guides count
    const [pendingGuides] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(rolesTable.name, "guide"),
          eq(userRolesTable.approvalStatus, "pending")
        )
      );

    const totalPending =
      (pendingRestaurants?.count || 0) +
      (pendingHotels?.count || 0) +
      (pendingGuides?.count || 0);

    return {
      success: true,
      data: {
        totalUsers: userCount?.count || 0,
        totalRestaurants: restaurantCount?.count || 0,
        totalHotels: hotelCount?.count || 0,
        totalGuides: guideCount?.count || 0,
        pendingRestaurants: pendingRestaurants?.count || 0,
        pendingHotels: pendingHotels?.count || 0,
        pendingGuides: pendingGuides?.count || 0,
        totalPending,
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
        totalGuides: 0,
        pendingRestaurants: 0,
        pendingHotels: 0,
        pendingGuides: 0,
        totalPending: 0,
      },
    };
  }
}

// 2. Get All Pending Approvals (Restaurants, Hotels, & Tour Guides)
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
        openingTime: restaurantsTable.openingTime,
        closingTime: restaurantsTable.closingTime,
        establishedDate: restaurantsTable.establishedDate,
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
        businessLocation: sql<string>`concat(${hotelsTable.street}, ', ', ${hotelsTable.municipality}, ' Ward ', ${hotelsTable.ward}, ', ', ${hotelsTable.district}, ', ', ${hotelsTable.province})`,
        businessPhone: hotelsTable.phoneNumber,
        website: hotelsTable.website,
        establishedYear: hotelsTable.establishedYear,
        street: hotelsTable.street,
        municipality: hotelsTable.municipality,
        ward: hotelsTable.ward,
        district: hotelsTable.district,
        province: hotelsTable.province,
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

    // Fetch Pending Tour Guides
    const pendingGuides = await db
      .select({
        userId: userRolesTable.userId,
        roleId: userRolesTable.roleId,
        approvalStatus: userRolesTable.approvalStatus,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        userCreatedAt: usersTable.createdAt,
        businessId: guidesTable.id,
        businessName: guidesTable.name,
        businessDescription: guidesTable.description,
        businessImage: guidesTable.guideImageUrl,
        businessLocation: guidesTable.location,
        businessPhone: guidesTable.phoneNumber,
        dailyRate: guidesTable.dailyRate,
        languages: guidesTable.languages,
        experienceYears: guidesTable.experienceYears,
        licenseNumber: guidesTable.licenseNumber,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .innerJoin(usersTable, eq(userRolesTable.userId, usersTable.id))
      .leftJoin(guidesTable, eq(usersTable.id, guidesTable.userId))
      .where(
        and(
          eq(rolesTable.name, "guide"),
          eq(userRolesTable.approvalStatus, "pending")
        )
      )
      .orderBy(desc(usersTable.createdAt));

    return {
      success: true,
      data: {
        restaurants: pendingRestaurants.map((r) => ({ ...r, type: "restaurant" as const })),
        hotels: pendingHotels.map((h) => ({ ...h, type: "hotel" as const })),
        guides: pendingGuides.map((g) => ({ ...g, type: "guide" as const })),
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
        guides: [],
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

    // Fetch user and business details to send approval notification email
    const [targetUser] = await db
      .select({ name: usersTable.name, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    let businessName = "Workspace Listing";
    let businessType: "Hotel" | "Restaurant" | "Tour Guide" = "Hotel";

    if (roleName === "hotelOwner") {
      businessType = "Hotel";
      const [h] = await db
        .select({ name: hotelsTable.name })
        .from(hotelsTable)
        .where(eq(hotelsTable.userId, userId));
      if (h?.name) businessName = h.name;
    } else if (roleName === "restaurantOwner") {
      businessType = "Restaurant";
      const [r] = await db
        .select({ name: restaurantsTable.name })
        .from(restaurantsTable)
        .where(eq(restaurantsTable.userId, userId));
      if (r?.name) businessName = r.name;
    } else if (roleName === "guide") {
      businessType = "Tour Guide";
      const [g] = await db
        .select({ name: guidesTable.name })
        .from(guidesTable)
        .where(eq(guidesTable.userId, userId));
      businessName = g?.name || targetUser?.name || "Tour Guide Profile";
    }

    if (targetUser?.email && (status === "approved" || status === "rejected")) {
      const { sendApprovalNotificationEmail } = await import("@/app/email/send-email");
      await sendApprovalNotificationEmail({
        email: targetUser.email,
        ownerName: targetUser.name || "Partner",
        businessName,
        businessType,
        status,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/approvals");
    revalidatePath("/dashboard/admin/companies");
    revalidatePath("/dashboard/admin/restaurants");
    revalidatePath("/dashboard/admin/hotels");
    revalidatePath("/dashboard/admin/guides");
    revalidatePath("/dashboard/restaurant");
    revalidatePath("/dashboard/hotels");
    revalidatePath("/dashboard/guide");
    revalidatePath("/restaurants");
    revalidatePath("/hotels");
    revalidatePath("/guides");
    revalidatePath("/workspace");

    return {
      success: true,
      message: `Partner request has been ${status.toUpperCase()} successfully! Notification email dispatched.`,
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

    const [restaurantOwnerRole] = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, "restaurantOwner"));

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
        ownerId: sql<number | null>`COALESCE(${usersTable.id}, ${restaurantsTable.userId}, 1)`,
        ownerName: sql<string>`COALESCE(${usersTable.name}, 'Platform Partner')`,
        ownerEmail: sql<string>`COALESCE(${usersTable.email}, 'partner@travelnepal.io')`,
        approvalStatus: sql<string>`COALESCE(${userRolesTable.approvalStatus}, 'approved')`,
      })
      .from(restaurantsTable)
      .leftJoin(usersTable, eq(restaurantsTable.userId, usersTable.id))
      .leftJoin(
        userRolesTable,
        and(
          eq(userRolesTable.userId, usersTable.id),
          restaurantOwnerRole?.id ? eq(userRolesTable.roleId, restaurantOwnerRole.id) : undefined
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

    const [hotelOwnerRole] = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, "hotelOwner"));

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
        ownerId: sql<number | null>`COALESCE(${usersTable.id}, ${hotelsTable.userId}, 1)`,
        ownerName: sql<string>`COALESCE(${usersTable.name}, 'Platform Partner')`,
        ownerEmail: sql<string>`COALESCE(${usersTable.email}, 'partner@travelnepal.io')`,
        approvalStatus: sql<string>`COALESCE(${userRolesTable.approvalStatus}, 'approved')`,
      })
      .from(hotelsTable)
      .leftJoin(usersTable, eq(hotelsTable.userId, usersTable.id))
      .leftJoin(
        userRolesTable,
        and(
          eq(userRolesTable.userId, usersTable.id),
          hotelOwnerRole?.id ? eq(userRolesTable.roleId, hotelOwnerRole.id) : undefined
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
        roles: sql<string>`COALESCE(STRING_AGG(DISTINCT CAST(${rolesTable.name} AS TEXT), ', '), 'tourist')`,
      })
      .from(usersTable)
      .leftJoin(userRolesTable, eq(userRolesTable.userId, usersTable.id))
      .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .groupBy(
        usersTable.id,
        usersTable.name,
        usersTable.email,
        usersTable.isVerified,
        usersTable.provider,
        usersTable.createdAt
      )
      .orderBy(desc(usersTable.id));

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

    const [guideRole] = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, "guide"));

    const guides = await db
      .select({
        id: guidesTable.id,
        userId: sql<number | null>`COALESCE(${guidesTable.userId}, 1)`,
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
        ownerEmail: sql<string>`COALESCE(${usersTable.email}, 'guide@travelnepal.io')`,
        approvalStatus: sql<string>`COALESCE(${userRolesTable.approvalStatus}, 'approved')`,
      })
      .from(guidesTable)
      .leftJoin(usersTable, eq(guidesTable.userId, usersTable.id))
      .leftJoin(
        userRolesTable,
        and(
          eq(userRolesTable.userId, usersTable.id),
          guideRole?.id ? eq(userRolesTable.roleId, guideRole.id) : undefined
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

// 11. Unified Company/Workspace Model for Super Admin
export interface AdminCompanyItem {
  id: number;
  type: "hotel" | "restaurant" | "guide" | "agency";
  typeLabel: string;
  name: string;
  description: string;
  location: string;
  phoneNumber?: string;
  imageUrl?: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  approvalStatus: string;
  extraInfo?: string;
  establishedYear?: number;
  cuisine?: string;
  dailyRate?: number;
  createdAt?: Date | null;
}

export async function getAllCompaniesAdmin(): Promise<ApiResponse<AdminCompanyItem[]>> {
  try {
    await requireAdmin();

    // 1. Hotels
    const hotels = await db
      .select({
        id: hotelsTable.id,
        name: hotelsTable.name,
        description: hotelsTable.description,
        phoneNumber: hotelsTable.phoneNumber,
        province: hotelsTable.province,
        district: hotelsTable.district,
        municipality: hotelsTable.municipality,
        street: hotelsTable.street,
        coverImageUrl: hotelsTable.coverImageUrl,
        establishedYear: hotelsTable.establishedYear,
        ownerId: usersTable.id,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        approvalStatus: userRolesTable.approvalStatus,
        createdAt: usersTable.createdAt,
      })
      .from(hotelsTable)
      .innerJoin(usersTable, eq(hotelsTable.userId, usersTable.id))
      .leftJoin(
        userRolesTable,
        and(
          eq(userRolesTable.userId, usersTable.id),
          eq(
            userRolesTable.roleId,
            sql`(SELECT id FROM roles WHERE name = 'hotelOwner' LIMIT 1)`
          )
        )
      );

    // 2. Restaurants
    const restaurants = await db
      .select({
        id: restaurantsTable.id,
        name: restaurantsTable.name,
        description: restaurantsTable.description,
        phoneNumber: restaurantsTable.phoneNumber,
        location: restaurantsTable.location,
        cuisine: restaurantsTable.cuisine,
        restaurantImageUrl: restaurantsTable.restaurantImageUrl,
        ownerId: usersTable.id,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        approvalStatus: userRolesTable.approvalStatus,
        createdAt: usersTable.createdAt,
      })
      .from(restaurantsTable)
      .innerJoin(usersTable, eq(restaurantsTable.userId, usersTable.id))
      .leftJoin(
        userRolesTable,
        and(
          eq(userRolesTable.userId, usersTable.id),
          eq(
            userRolesTable.roleId,
            sql`(SELECT id FROM roles WHERE name = 'restaurantOwner' LIMIT 1)`
          )
        )
      );

    // 3. Tour Guides
    const guides = await db
      .select({
        id: guidesTable.id,
        name: guidesTable.name,
        description: guidesTable.description,
        phoneNumber: guidesTable.phoneNumber,
        location: guidesTable.location,
        guideImageUrl: guidesTable.guideImageUrl,
        experienceYears: guidesTable.experienceYears,
        languages: guidesTable.languages,
        dailyRate: guidesTable.dailyRate,
        ownerId: usersTable.id,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        approvalStatus: userRolesTable.approvalStatus,
        createdAt: guidesTable.createdAt,
      })
      .from(guidesTable)
      .innerJoin(usersTable, eq(guidesTable.userId, usersTable.id))
      .leftJoin(
        userRolesTable,
        and(
          eq(userRolesTable.userId, usersTable.id),
          eq(
            userRolesTable.roleId,
            sql`(SELECT id FROM roles WHERE name = 'guide' LIMIT 1)`
          )
        )
      );

    // 4. Travel Providers / Agencies
    const providers = await db
      .select({
        id: travelProvidersTable.id,
        name: travelProvidersTable.companyName,
        description: travelProvidersTable.description,
        phoneNumber: travelProvidersTable.contactPhone,
        location: travelProvidersTable.address,
        imageUrl: travelProvidersTable.logoUrl,
        ownerId: usersTable.id,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
        approvalStatus: travelProvidersTable.approvalStatus,
        createdAt: travelProvidersTable.createdAt,
      })
      .from(travelProvidersTable)
      .innerJoin(usersTable, eq(travelProvidersTable.userId, usersTable.id));

    const standardizedList: AdminCompanyItem[] = [
      ...hotels.map((h) => ({
        id: h.id,
        type: "hotel" as const,
        typeLabel: "Hotel & Stay",
        name: h.name,
        description: h.description,
        location: `${h.street || ""}, ${h.municipality || ""}, ${h.district || ""}, ${h.province || ""}`.replace(/^[,\s]+|[,\s]+$/g, ""),
        phoneNumber: h.phoneNumber,
        imageUrl: h.coverImageUrl || undefined,
        ownerId: h.ownerId,
        ownerName: h.ownerName,
        ownerEmail: h.ownerEmail,
        approvalStatus: h.approvalStatus || "pending",
        establishedYear: h.establishedYear || undefined,
        createdAt: h.createdAt,
      })),
      ...restaurants.map((r) => ({
        id: r.id,
        type: "restaurant" as const,
        typeLabel: "Dining & Restaurant",
        name: r.name,
        description: r.description,
        location: r.location || "Nepal",
        phoneNumber: r.phoneNumber,
        imageUrl: r.restaurantImageUrl || undefined,
        cuisine: r.cuisine || undefined,
        ownerId: r.ownerId,
        ownerName: r.ownerName,
        ownerEmail: r.ownerEmail,
        approvalStatus: r.approvalStatus || "pending",
        createdAt: r.createdAt,
      })),
      ...guides.map((g) => ({
        id: g.id,
        type: "guide" as const,
        typeLabel: "Tour Guide Service",
        name: g.name,
        description: g.description,
        location: g.location || "Nepal",
        phoneNumber: g.phoneNumber,
        imageUrl: g.guideImageUrl || undefined,
        dailyRate: g.dailyRate || undefined,
        extraInfo: g.languages ? `Languages: ${g.languages} • ${g.experienceYears || 0} yrs exp` : undefined,
        ownerId: g.ownerId,
        ownerName: g.ownerName,
        ownerEmail: g.ownerEmail,
        approvalStatus: g.approvalStatus || "pending",
        createdAt: g.createdAt,
      })),
      ...providers.map((p) => ({
        id: p.id,
        type: "agency" as const,
        typeLabel: "Travel Agency",
        name: p.name,
        description: p.description || "Certified Nepal Travel Agency",
        location: p.location || "Nepal",
        phoneNumber: p.phoneNumber || undefined,
        imageUrl: p.imageUrl || undefined,
        ownerId: p.ownerId,
        ownerName: p.ownerName,
        ownerEmail: p.ownerEmail,
        approvalStatus: p.approvalStatus || "pending",
        createdAt: p.createdAt,
      })),
    ];

    // Sort by most recent
    standardizedList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return {
      success: true,
      message: "Companies fetched successfully",
      data: standardizedList,
    };
  } catch (error: any) {
    console.error("Error fetching all companies for admin:", error);
    return {
      success: false,
      message: error?.message || "Failed to fetch companies list",
      data: [],
    };
  }
}

// 12. Delete / Revoke Partner Workspace Action
export async function deletePartnerWorkspaceAction(
  type: "hotel" | "restaurant" | "guide" | "agency",
  entityId: number,
  ownerId: number
): Promise<ApiResponse<null>> {
  try {
    await requireAdmin();

    if (type === "hotel") {
      await db.delete(hotelsTable).where(eq(hotelsTable.id, entityId));
      // Reset user role if no other hotels
      const remaining = await db.select().from(hotelsTable).where(eq(hotelsTable.userId, ownerId));
      if (remaining.length === 0) {
        const [role] = await db.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, "hotelOwner"));
        if (role) {
          await db.delete(userRolesTable).where(and(eq(userRolesTable.userId, ownerId), eq(userRolesTable.roleId, role.id)));
        }
      }
    } else if (type === "restaurant") {
      await db.delete(restaurantsTable).where(eq(restaurantsTable.id, entityId));
      const remaining = await db.select().from(restaurantsTable).where(eq(restaurantsTable.userId, ownerId));
      if (remaining.length === 0) {
        const [role] = await db.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, "restaurantOwner"));
        if (role) {
          await db.delete(userRolesTable).where(and(eq(userRolesTable.userId, ownerId), eq(userRolesTable.roleId, role.id)));
        }
      }
    } else if (type === "guide") {
      await db.delete(guidesTable).where(eq(guidesTable.id, entityId));
      const remaining = await db.select().from(guidesTable).where(eq(guidesTable.userId, ownerId));
      if (remaining.length === 0) {
        const [role] = await db.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, "guide"));
        if (role) {
          await db.delete(userRolesTable).where(and(eq(userRolesTable.userId, ownerId), eq(userRolesTable.roleId, role.id)));
        }
      }
    } else if (type === "agency") {
      await db.delete(travelProvidersTable).where(eq(travelProvidersTable.id, entityId));
    }

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/companies");
    revalidatePath("/dashboard/admin/hotels");
    revalidatePath("/dashboard/admin/restaurants");
    revalidatePath("/dashboard/admin/guides");
    revalidatePath("/hotels");
    revalidatePath("/restaurants");
    revalidatePath("/guides");

    return {
      success: true,
      message: `${type.toUpperCase()} workspace deleted and access updated successfully.`,
    };
  } catch (error: any) {
    console.error("Error deleting workspace:", error);
    return {
      success: false,
      message: error?.message || "Failed to delete workspace",
    };
  }
}

// 13. Delete User Admin Action
export async function deleteUserAdminAction(userId: number): Promise<ApiResponse<null>> {
  try {
    const session = await requireAdmin();
    if (Number(session.user.id) === userId) {
      return { success: false, message: "Super Admin cannot delete their own account from here." };
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin/companies");
    return { success: true, message: "User account deleted successfully." };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to delete user" };
  }
}


