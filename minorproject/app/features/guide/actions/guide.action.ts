"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  bookingsTable,
  guideAvailabilityTable,
  guidesTable,
  packagesTable,
} from "@/app/lib/db/schema";
import { ApiResponse } from "@/app/types/api";

async function requireGuide() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in");
  }

  const isGuide = session.user.roles?.some((r) => r.name === "guide");
  if (!isGuide) {
    throw new Error("Forbidden: Guide account required");
  }

  let [guide] = await db
    .select()
    .from(guidesTable)
    .where(eq(guidesTable.userId, Number(session.user.id)));

  // Auto-initialize guide profile if first time
  if (!guide) {
    [guide] = await db
      .insert(guidesTable)
      .values({
        userId: Number(session.user.id),
        name: session.user.name || "Tour Guide",
        description: "Certified professional local guide in Nepal.",
        location: "Kathmandu, Nepal",
        phoneNumber: "9800000000",
        guideImageUrl: "",
        experienceYears: 2,
        languages: "Nepali, English",
        dailyRate: 2500,
        isAvailable: true,
      })
      .returning();
  }

  return { session, guide };
}

// 1. Update Guide Profile
export async function updateGuideProfile(data: {
  name: string;
  description: string;
  location: string;
  phoneNumber: string;
  guideImageUrl?: string;
  experienceYears: number;
  languages: string;
  dailyRate: number;
  licenseNumber?: string;
  isAvailable: boolean;
}): Promise<ApiResponse<null>> {
  try {
    const { guide } = await requireGuide();

    await db
      .update(guidesTable)
      .set({
        name: data.name,
        description: data.description,
        location: data.location,
        phoneNumber: data.phoneNumber,
        guideImageUrl: data.guideImageUrl || guide.guideImageUrl,
        experienceYears: data.experienceYears,
        languages: data.languages,
        dailyRate: data.dailyRate,
        licenseNumber: data.licenseNumber,
        isAvailable: data.isAvailable,
      })
      .where(eq(guidesTable.id, guide.id));

    revalidatePath("/dashboard/guide");
    revalidatePath("/dashboard/guide/settings");
    revalidatePath("/dashboard/guide/availability");

    return { success: true, message: "Guide profile updated successfully!" };
  } catch (error: any) {
    console.error("Error updating guide profile:", error);
    return { success: false, message: error?.message || "Failed to update profile" };
  }
}

// 2. Package Management (Create, Update, Delete)
export async function saveTourPackage(data: {
  id?: number;
  title: string;
  description: string;
  destination: string;
  durationDays: number;
  price: number;
  maxGroupSize: number;
  itinerary?: string;
  included?: string;
  excluded?: string;
  packageImageUrl?: string;
  isPublished?: boolean;
}): Promise<ApiResponse<null>> {
  try {
    const { guide } = await requireGuide();

    if (data.id) {
      // Update
      await db
        .update(packagesTable)
        .set({
          title: data.title,
          description: data.description,
          destination: data.destination,
          durationDays: data.durationDays,
          price: data.price,
          maxGroupSize: data.maxGroupSize,
          itinerary: data.itinerary,
          included: data.included,
          excluded: data.excluded,
          packageImageUrl: data.packageImageUrl,
          isPublished: data.isPublished ?? true,
        })
        .where(
          and(
            eq(packagesTable.id, data.id),
            eq(packagesTable.guideId, guide.id)
          )
        );
    } else {
      // Insert
      await db.insert(packagesTable).values({
        guideId: guide.id,
        title: data.title,
        description: data.description,
        destination: data.destination,
        durationDays: data.durationDays,
        price: data.price,
        maxGroupSize: data.maxGroupSize,
        itinerary: data.itinerary,
        included: data.included,
        excluded: data.excluded,
        packageImageUrl: data.packageImageUrl,
        isPublished: data.isPublished ?? true,
      });
    }

    revalidatePath("/dashboard/guide/packages");
    revalidatePath("/dashboard/guide");

    return {
      success: true,
      message: data.id ? "Tour package updated!" : "New tour package published successfully!",
    };
  } catch (error: any) {
    console.error("Error saving package:", error);
    return { success: false, message: error?.message || "Failed to save package" };
  }
}

export async function deleteTourPackage(packageId: number): Promise<ApiResponse<null>> {
  try {
    const { guide } = await requireGuide();

    await db
      .delete(packagesTable)
      .where(
        and(
          eq(packagesTable.id, packageId),
          eq(packagesTable.guideId, guide.id)
        )
      );

    revalidatePath("/dashboard/guide/packages");
    return { success: true, message: "Tour package deleted" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to delete package" };
  }
}

// 3. Update Booking Status (Confirm / Cancel / Complete)
export async function updateGuideBookingStatus(
  bookingId: number,
  status: "confirmed" | "cancelled" | "completed"
): Promise<ApiResponse<null>> {
  try {
    await requireGuide();

    await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, bookingId));

    revalidatePath("/dashboard/guide/bookings");
    revalidatePath("/dashboard/guide");

    return { success: true, message: `Booking marked as ${status.toUpperCase()}!` };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to update booking" };
  }
}

// 4. Toggle Date Availability
export async function toggleGuideDateAvailability(
  date: string,
  isAvailable: boolean,
  note?: string
): Promise<ApiResponse<null>> {
  try {
    const { guide } = await requireGuide();

    const [existing] = await db
      .select()
      .from(guideAvailabilityTable)
      .where(
        and(
          eq(guideAvailabilityTable.guideId, guide.id),
          eq(guideAvailabilityTable.date, date)
        )
      );

    if (existing) {
      await db
        .update(guideAvailabilityTable)
        .set({ isAvailable, note })
        .where(eq(guideAvailabilityTable.id, existing.id));
    } else {
      await db.insert(guideAvailabilityTable).values({
        guideId: guide.id,
        date,
        isAvailable,
        note,
      });
    }

    revalidatePath("/dashboard/guide/availability");
    return { success: true, message: "Availability schedule updated!" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to update availability" };
  }
}
