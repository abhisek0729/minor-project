import Link from "next/link";
import {
  BedDouble,
  Building2,
  CalendarCheck,
  ClipboardList,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Star,
} from "lucide-react";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import { getRooms } from "@/app/features/hotel/actions/getRooms";

import { PageHeader } from "@/app/features/hotel/components/dashboard/PageHeader";
import { StatsCard } from "@/app/features/hotel/components/dashboard/StatsCard";

import { StatusBadge } from "@/app/features/shared/components/StatusBadge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default async function HotelDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const hotel = await getHotelByOwnerId(Number(session.user.id));

  if (!hotel) {
    redirect("/onboarding/hotel");
  }

  const hotelRole = session.user.roles!.find(
    (role) => role.name === "hotelOwner",
  );

  const approvalStatus = hotelRole?.approvalStatus;

  if (approvalStatus === "pending") {
    redirect("/dashboard/hotels/pending");
  }

  if (approvalStatus === "rejected") {
    redirect("/dashboard/hotels/rejected");
  }

  if (approvalStatus === "suspended") {
    redirect("/dashboard/hotels/suspended");
  }

  const roomsResult = await getRooms();

  const rooms = roomsResult.success ? roomsResult.data : [];

  const location = [
    hotel.ward,
    hotel.municipality,
    hotel.district,
    hotel.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${
          session.user.name?.split(" ")[0] ?? "Hotel Owner"
        }`}
        description="Monitor your hotel and manage daily operations."
      />

      {/* Stats */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Hotel Status"
          value={approvalStatus!}
          icon={Building2}
          changeLabel="Approval status"
        />

        <StatsCard
          title="Rooms"
          value={rooms.length}
          icon={BedDouble}
          changeLabel={
            rooms.length === 0 ? "Add your first room." : "Total rooms"
          }
        />

        <StatsCard
          title="Bookings"
          value={0}
          icon={CalendarCheck}
          changeLabel="Coming soon"
        />

        <StatsCard
          title="Average Rating"
          value="—"
          icon={Star}
          changeLabel="No reviews yet"
        />
      </section>


      <div className="grid gap-6 xl:grid-cols-3">
        {/* Hotel Overview */}

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Hotel Overview</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Hotel Name</p>

              <p className="font-medium">{hotel.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>

              <StatusBadge status={hotelRole?.approvalStatus ?? "pending"} />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Location</p>

              <div className="mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />

                <span>{location}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>

              <p className="font-medium">{rooms.length}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>

              <p className="mt-1">
                {hotel.description ?? "No description available."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>

            <CardDescription>
              Complete these steps to prepare your hotel.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Hotel Information</span>

              <StatusBadge status="approved" />
            </div>

            <div className="flex items-center justify-between">
              <span>Add Rooms</span>

              {rooms.length > 0 ? (
                <StatusBadge status="completed" />
              ) : (
                <StatusBadge status="pending" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span>Start Receiving Bookings</span>

              <StatusBadge status="pending" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>

          <CardDescription>
            Activity related to your hotel will appear here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed">
            <ClipboardList className="mb-4 size-10 text-muted-foreground" />

            <p className="font-medium">No activity yet</p>

            <p className="mt-1 text-center text-sm text-muted-foreground">
              Bookings, reviews, and other updates will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
