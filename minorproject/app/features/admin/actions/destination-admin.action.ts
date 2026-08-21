"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { destinationsTable, usersTable, userRolesTable, rolesTable } from "@/app/lib/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fallbackDestinations from "@/app/lib/db/destinations-data.json";

export interface DestinationFormData {
  name: string;
  region: string;
  category: string;
  altitude?: string;
  bestSeason?: string;
  startingCost?: string;
  coverImage: string;
  shortDescription: string;
  historyAndCulture?: string;
  activities?: string[];
  highlights?: string[];
  mapQuery?: string;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const userEmail = session.user.email?.toLowerCase();
  if (userEmail !== "manoj@gmail.com") {
    // Check if role is admin
    const userRole = await db
      .select({ roleName: rolesTable.name })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, Number(session.user.id)))
      .limit(1);

    if (userRole[0]?.roleName !== "admin") {
      throw new Error("Forbidden: Super Admin access required.");
    }
  }

  return session;
}

// 1. Get All Destinations for Admin
export async function getAllDestinationsAdmin() {
  try {
    await requireAdmin();

    const rows = await db
      .select()
      .from(destinationsTable)
      .orderBy(asc(destinationsTable.id));

    if (rows && rows.length > 0) {
      return { success: true, data: rows };
    }
  } catch (error: any) {
    console.warn("DB query fallback in getAllDestinationsAdmin:", error);
  }

  return { success: true, data: fallbackDestinations };
}

// 2. Create New Destination Admin Action
export async function createDestinationAdminAction(data: DestinationFormData) {
  try {
    await requireAdmin();

    if (!data.name || !data.region || !data.category || !data.coverImage || !data.shortDescription) {
      return { success: false, message: "Please fill in all required fields (Name, Region, Category, Cover Image, Description)." };
    }

    // Get next ID
    const [maxResult] = await db
      .select({ maxId: sql<number>`COALESCE(MAX(${destinationsTable.id}), 0)` })
      .from(destinationsTable);

    const nextId = (maxResult?.maxId || 150) + 1;

    const [inserted] = await db
      .insert(destinationsTable)
      .values({
        id: nextId,
        name: data.name.trim(),
        region: data.region.trim(),
        category: data.category.trim(),
        altitude: data.altitude?.trim() || null,
        bestSeason: data.bestSeason?.trim() || null,
        startingCost: data.startingCost?.trim() || null,
        coverImage: data.coverImage.trim(),
        shortDescription: data.shortDescription.trim(),
        historyAndCulture: data.historyAndCulture?.trim() || data.shortDescription.trim(),
        activities: data.activities && data.activities.length > 0 ? data.activities : ["Sightseeing", "Photography", "Cultural Tour"],
        highlights: data.highlights && data.highlights.length > 0 ? data.highlights : ["Scenic Viewpoint", "Local Culture", "Photography Spots"],
        mapQuery: data.mapQuery?.trim() || `${data.name.trim()}, Nepal`,
        rating: 4.9,
        reviews: 50,
        nearbyAttractions: [],
      })
      .returning();

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/destinations");
    revalidatePath("/destinations");
    revalidatePath(`/destinations/${nextId}`);
    revalidatePath("/");

    return {
      success: true,
      message: `Destination "${inserted.name}" added successfully (ID #${inserted.id})!`,
      data: inserted,
    };
  } catch (error: any) {
    console.error("Error creating destination:", error);
    return { success: false, message: error?.message || "Failed to create destination" };
  }
}

// 3. Delete Destination Admin Action
export async function deleteDestinationAdminAction(id: number) {
  try {
    await requireAdmin();

    await db.delete(destinationsTable).where(eq(destinationsTable.id, id));

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/destinations");
    revalidatePath("/destinations");
    revalidatePath(`/destinations/${id}`);
    revalidatePath("/");

    return {
      success: true,
      message: `Destination #${id} removed successfully.`,
    };
  } catch (error: any) {
    console.error("Error deleting destination:", error);
    return { success: false, message: error?.message || "Failed to delete destination" };
  }
}
