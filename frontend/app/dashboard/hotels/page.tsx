import Link from "next/link";
import {
  BedDouble,
  Building2,
  CalendarCheck,
  ClipboardList,
  Eye,
  Hotel,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import { getRooms } from "@/app/features/hotel/actions/getRooms";
import { PageHeader } from "@/app/features/hotel/components/dashboard/PageHeader";
import { StatsCard } from "@/app/features/hotel/components/dashboard/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HotelDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const hotel = await getHotelByOwnerId(Number(session.user.id));

  if (!hotel) {
    redirect("/onboarding/hotel");
  }

  const { getUserRoles } = await import("@/app/features/auth/services/roles.service");
  const userRoles = await getUserRoles(Number(session.user.id));
  const hotelRole = userRoles.find((role) => role.name === "hotelOwner");

  const approvalStatus = hotelRole?.approvalStatus ?? "pending";

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={`Welcome back, ${hotel.name}`}
          description="Monitor your hotel rooms, reservations, and daily guest operations."
        />

        <div className="flex items-center gap-3">
          <Link href="/dashboard/hotels/rooms/new">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Plus className="size-4" /> Add Room
            </Button>
          </Link>
          <Link href="/dashboard/hotels/rooms">
            <Button size="sm" variant="outline" className="gap-1.5">
              <BedDouble className="size-4" /> View All Rooms
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Rooms"
          value={rooms.length}
          icon={BedDouble}
          changeLabel={
            rooms.length === 0 ? "Add your first room." : "Available room units"
          }
        />

        <StatsCard
          title="Active Bookings"
          value={0}
          icon={CalendarCheck}
          changeLabel="Guest reservations"
        />

        <StatsCard
          title="Guest Rating"
          value="4.9"
          icon={Star}
          changeLabel="Based on verified stays"
        />
      </section>

      {/* Room Inventory & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Room Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Room Inventory</CardTitle>
              <CardDescription>
                {rooms.length} room type{rooms.length === 1 ? "" : "s"} listed
              </CardDescription>
            </div>
            <Link href="/dashboard/hotels/rooms">
              <Button variant="link" size="sm" className="text-xs p-0">
                Manage Rooms →
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {rooms.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                <BedDouble className="size-8 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold">No rooms added yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start adding Deluxe, Standard, or Suite rooms to receive traveler bookings.
                </p>
                <Link href="/dashboard/hotels/rooms/new" className="mt-3">
                  <Button size="sm" className="text-xs">Add First Room</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.slice(0, 3).map((room: any) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between rounded-xl border p-3.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <BedDouble className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{room.title || room.roomType}</p>
                        <p className="text-xs text-muted-foreground">
                          NPR {room.pricePerNight?.toLocaleString()} / night • Max {room.capacity || 2} Guests
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {room.isAvailable !== false ? "Available" : "Booked"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity & Bookings</CardTitle>
            <CardDescription>
              Real-time reservation alerts and guest check-ins.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
              <ClipboardList className="mb-2 size-8 text-muted-foreground" />
              <p className="font-semibold text-sm">No recent bookings</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New room reservations and guest reviews will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
