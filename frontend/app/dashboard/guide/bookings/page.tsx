import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getGuideBookings,
  getGuideByUserId,
} from "@/app/features/guide/services/guide.service";
import GuideBookingsTable from "@/app/features/guide/components/bookings/GuideBookingsTable";

export default async function GuideBookingsPage() {
  const session = await getServerSession(authOptions);
  const guide = await getGuideByUserId(Number(session?.user?.id));

  if (!guide) {
    return <div>Guide not found</div>;
  }

  const bookings = await getGuideBookings(guide.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Traveler Booking Requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage upcoming tour clients, accept bookings, and track payment confirmations.
        </p>
      </div>

      <GuideBookingsTable initialBookings={bookings} />
    </div>
  );
}
