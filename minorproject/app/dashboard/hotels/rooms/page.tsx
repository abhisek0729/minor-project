import Link from "next/link";
import { BedDouble, Plus } from "lucide-react";

import { getRooms } from "@/app/features/hotel/actions/getRooms";
import RoomsTable from "@/app/features/hotel/components/rooms/RoomsTable";
import { EmptyState } from "@/app/features/shared/components/EmptyState";
import { PageHeader } from "@/app/features/hotel/components/dashboard/PageHeader";
import RoomsFilters from "@/app/features/hotel/components/rooms/filters/RoomFilter";
import { Button } from "@/components/ui/button";

interface RoomsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    roomType?: string;
    sortBy?: string;
  }>;
}

export default async function RoomsPage({
  searchParams,
}: RoomsPageProps) {
  const params = await searchParams;

  const result = await getRooms({
    search: params.search,
    status: params.status as any,
    roomType: params.roomType as any,
    sortBy: params.sortBy as any,
  });


  if (!result.success) {
    return (
      <EmptyState
        title="Hotel not found"
        description="Complete your hotel onboarding before managing your rooms."
        icon={BedDouble}
        action={
          <Button>
            <Link href="/dashboard/hotels/onboarding">
              Complete Hotel Setup
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 h-full">
      <PageHeader
        title="Rooms"
        description="Manage your hotel's rooms, pricing, and availability."
        actions={
          <Button className="p-3 py-5">
            <Link className="flex"  href="/dashboard/hotels/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Link>
          </Button>
        }
      />

      <RoomsFilters />
      {result.data.length === 0 ? (
        <EmptyState
          title="No rooms found"
          description="Create your first room to start accepting bookings."
          icon={BedDouble}
          action={
            <Button>
              <Link href="/dashboard/hotels/rooms/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Link>
            </Button>
          }
        />
      ) : (
        <RoomsTable rooms={result.data} />
      )}
    </div>
  );
}