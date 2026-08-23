import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getFacilities } from "@/app/features/hotel/actions/getFacilities";
import { getRoomById } from "@/app/features/hotel/actions/getRoomById";
import { PageHeader } from "@/app/features/hotel/components/dashboard/PageHeader";
import RoomForm from "@/app/features/hotel/components/rooms/RoomForm";

interface EditRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditRoomPage({
  params,
}: EditRoomPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { roomId } = await params;

  const room = await getRoomById(Number(roomId));

  if (!room) {
    notFound();
  }

  const facilities = await getFacilities();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Room"
        description="Update your room information, pricing, facilities and images."
      />

      <RoomForm
        mode="edit"
        roomId={Number(roomId)}
        initialData={room}
        facilities={facilities.data}
      />
    </div>
  );
}