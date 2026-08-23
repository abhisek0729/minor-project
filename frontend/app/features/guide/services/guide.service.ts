import { db } from "@/app/lib/db";
import {
  bookingsTable,
  guideAvailabilityTable,
  guidesTable,
  packagesTable,
  reviewsTable,
  usersTable,
} from "@/app/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getGuideByUserId(userId: number) {
  const [guide] = await db
    .select()
    .from(guidesTable)
    .where(eq(guidesTable.userId, userId));

  return guide || null;
}

export async function getGuidePackages(guideId: number) {
  return db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.guideId, guideId))
    .orderBy(desc(packagesTable.createdAt));
}

export async function getGuideAvailability(guideId: number) {
  return db
    .select()
    .from(guideAvailabilityTable)
    .where(eq(guideAvailabilityTable.guideId, guideId))
    .orderBy(guideAvailabilityTable.date);
}

export async function getGuideBookings(guideId: number) {
  return db
    .select({
      id: bookingsTable.id,
      userId: bookingsTable.userId,
      bookingType: bookingsTable.bookingType,
      itemId: bookingsTable.itemId,
      itemName: bookingsTable.itemName,
      checkInDate: bookingsTable.checkInDate,
      checkOutDate: bookingsTable.checkOutDate,
      guests: bookingsTable.guests,
      totalAmount: bookingsTable.totalAmount,
      status: bookingsTable.status,
      paymentStatus: bookingsTable.paymentStatus,
      specialRequests: bookingsTable.specialRequests,
      createdAt: bookingsTable.createdAt,
      customerName: usersTable.name,
      customerEmail: usersTable.email,
    })
    .from(bookingsTable)
    .innerJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
    .where(
      and(
        eq(bookingsTable.itemId, guideId),
        sql`${bookingsTable.bookingType} IN ('guide', 'package')`
      )
    )
    .orderBy(desc(bookingsTable.createdAt));
}

export async function getGuideStats(guideId: number) {
  const bookings = await getGuideBookings(guideId);
  const packages = await getGuidePackages(guideId);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalGuests = confirmedBookings.reduce((sum, b) => sum + (b.guests || 1), 0);
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;

  const [reviewStats] = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 5.0)`,
      reviewCount: sql<number>`CAST(COUNT(*) as integer)`,
    })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.targetType, "guide"),
        eq(reviewsTable.targetId, guideId)
      )
    );

  return {
    totalTours: confirmedBookings.length,
    activePackages: packages.filter((p) => p.isPublished).length,
    totalRevenue,
    totalGuests,
    pendingRequests,
    avgRating: Number(reviewStats?.avgRating || 5).toFixed(1),
    reviewCount: reviewStats?.reviewCount || 0,
    recentBookings: bookings.slice(0, 5),
  };
}
