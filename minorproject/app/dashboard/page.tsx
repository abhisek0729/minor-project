import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { usersTable } from "@/app/lib/db/schema";
import { getUserRoles } from "@/app/features/auth/services/roles.service";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import { getGuideByUserId } from "@/app/features/guide/services/guide.service";
import { getUserBookings } from "@/app/features/bookings/services/user-bookings.service";
import UnifiedDashboardView from "@/app/features/dashboard/components/UnifiedDashboardView";

export const dynamic = "force-dynamic";

export default async function MainDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = Number(session.user.id);

  // Fetch fresh, live roles from database directly (eliminates stale JWT issue without signing out)
  const roles = await getUserRoles(userId);
  const isAdmin = roles.some((r) => r.name === "admin" && r.approvalStatus === "approved");

  if (isAdmin) {
    redirect("/dashboard/admin");
  }

  const hasRestaurant = roles.some((r) => r.name === "restaurantOwner");
  const hasHotel = roles.some((r) => r.name === "hotelOwner");
  const hasGuide = roles.some((r) => r.name === "guide");

  // Fetch user data, partner listings & user bookings all concurrently in single round-trip
  const [[dbUser], restaurant, hotel, guide, bookings] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, userId)),
    hasRestaurant ? getRestaurantByOwnerId(userId) : Promise.resolve(null),
    hasHotel ? getHotelByOwnerId(userId) : Promise.resolve(null),
    hasGuide ? getGuideByUserId(userId) : Promise.resolve(null),
    getUserBookings(userId),
  ]);

  const name = dbUser?.name || session.user.name || "User";
  const email = dbUser?.email || session.user.email || "";
  const isVerified = dbUser?.isVerified ?? session.user.is_verified ?? false;
  const provider = dbUser?.provider || "credentials";
  const createdAt = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <UnifiedDashboardView
      user={{
        id: session.user.id,
        name,
        email,
        isVerified,
        provider,
        createdAt,
        initials,
      }}
      roles={roles}
      restaurant={restaurant}
      hotel={hotel}
      guide={guide}
      bookings={bookings}
    />
  );
}
