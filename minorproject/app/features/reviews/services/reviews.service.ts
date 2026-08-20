import { db } from "@/app/lib/db";
import { reviewsTable, usersTable } from "@/app/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getReviewsForTarget(
  targetType: "hotel" | "restaurant" | "guide" | "package",
  targetId: number
) {
  try {
    return await db
      .select({
        id: reviewsTable.id,
        userId: reviewsTable.userId,
        userName: reviewsTable.userName,
        userImage: reviewsTable.userImage,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        createdAt: reviewsTable.createdAt,
      })
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.targetType, targetType),
          eq(reviewsTable.targetId, targetId)
        )
      )
      .orderBy(desc(reviewsTable.createdAt));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function getRatingSummary(
  targetType: "hotel" | "restaurant" | "guide" | "package",
  targetId: number
) {
  try {
    const [stats] = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 0)`,
        totalReviews: sql<number>`CAST(COUNT(*) as integer)`,
        fiveStars: sql<number>`CAST(COUNT(CASE WHEN ${reviewsTable.rating} = 5 THEN 1 END) as integer)`,
        fourStars: sql<number>`CAST(COUNT(CASE WHEN ${reviewsTable.rating} = 4 THEN 1 END) as integer)`,
        threeStars: sql<number>`CAST(COUNT(CASE WHEN ${reviewsTable.rating} = 3 THEN 1 END) as integer)`,
        twoStars: sql<number>`CAST(COUNT(CASE WHEN ${reviewsTable.rating} = 2 THEN 1 END) as integer)`,
        oneStar: sql<number>`CAST(COUNT(CASE WHEN ${reviewsTable.rating} = 1 THEN 1 END) as integer)`,
      })
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.targetType, targetType),
          eq(reviewsTable.targetId, targetId)
        )
      );

    return {
      avgRating: Number(stats?.avgRating || 0).toFixed(1),
      totalReviews: stats?.totalReviews || 0,
      breakdown: {
        5: stats?.fiveStars || 0,
        4: stats?.fourStars || 0,
        3: stats?.threeStars || 0,
        2: stats?.twoStars || 0,
        1: stats?.oneStar || 0,
      },
    };
  } catch (error) {
    console.error("Error calculating rating summary:", error);
    return {
      avgRating: "0.0",
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
}
