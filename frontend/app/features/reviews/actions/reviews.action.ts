"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { reviewsTable } from "@/app/lib/db/schema";
import { ApiResponse } from "@/app/types/api";

export async function submitReview(data: {
  targetType: "hotel" | "restaurant" | "guide" | "package";
  targetId: number;
  rating: number;
  comment: string;
}): Promise<ApiResponse<null>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Please sign in to leave a review." };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, message: "Rating must be between 1 and 5 stars." };
    }

    if (!data.comment || data.comment.trim().length < 5) {
      return { success: false, message: "Please write at least a short comment (5+ chars)." };
    }

    await db.insert(reviewsTable).values({
      userId: Number(session.user.id),
      userName: session.user.name || "Verified Traveler",
      userImage: (session.user as any).image || "",
      targetType: data.targetType,
      targetId: data.targetId,
      rating: Math.round(data.rating),
      comment: data.comment.trim(),
    });

    if (data.targetType === "restaurant") {
      revalidatePath(`/restaurants/${data.targetId}`);
      revalidatePath("/restaurants");
    } else if (data.targetType === "hotel") {
      revalidatePath(`/hotels/${data.targetId}`);
      revalidatePath("/hotels");
    } else if (data.targetType === "guide") {
      revalidatePath(`/guides/${data.targetId}`);
    }

    return {
      success: true,
      message: "Thank you! Your review and rating has been published.",
    };
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      message: error?.message || "Failed to submit review",
    };
  }
}
