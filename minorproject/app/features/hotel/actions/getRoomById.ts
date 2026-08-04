"use server";

import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  hotelsTable,
  roomFacilitiesTable,
  roomImagesTable,
  roomsTable,
} from "@/app/lib/db/schema";

export async function getRoomById(roomId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get room
  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, roomId));

  if (!room) {
    return null;
  }

  // Verify hotel ownership
  const [hotel] = await db
    .select({
      ownerId: hotelsTable.user_id,
    })
    .from(hotelsTable)
    .where(eq(hotelsTable.id, room.hotel_id));

  if (!hotel || hotel.ownerId !== Number(session.user.id)) {
    return null;
  }

  // Room images
  const images = await db
    .select({
      imageUrl: roomImagesTable.image_url,
      publicId: roomImagesTable.public_id,
    })
    .from(roomImagesTable)
    .where(eq(roomImagesTable.room_id, roomId));

  // Selected facilities
  const facilities = await db
    .select({
      facilityId: roomFacilitiesTable.facility_id,
    })
    .from(roomFacilitiesTable)
    .where(eq(roomFacilitiesTable.room_id, roomId));

 return {
  roomNumber: room.room_number,
  roomType: room.room_type,
  description: room.description,
  pricePerNight: Number(room.price_per_night),
  capacity: room.capacity,
  status: room.status,

  facilityIds: facilities.map((f) => f.facilityId),

  imageUrls: images,
};
}