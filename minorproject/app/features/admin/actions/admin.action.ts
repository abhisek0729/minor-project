"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, desc, eq, sql } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  hotelsTable,
  restaurantsTable,
  rolesTable,
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
