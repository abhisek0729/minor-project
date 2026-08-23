import { notFound } from "next/navigation";

import RoomForm from "@/app/features/hotel/components/rooms/RoomForm";
import { PageHeader } from "@/app/features/hotel/components/dashboard/PageHeader";
import { getFacilities } from "@/app/features/hotel/actions/getFacilities";

export default async function CreateRoomPage() {
  const result = await getFacilities();

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Room"
        description="Create a new room and configure its details, facilities, pricing, and images."
      />

      <RoomForm mode="create" facilities={result.data} />
    </div>
  );
}