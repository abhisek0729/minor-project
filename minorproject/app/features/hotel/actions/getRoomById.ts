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
      ownerId: hotelsTable.userId,
    })
    .from(hotelsTable)
    .where(eq(hotelsTable.id, room.hotelId));

  if (!hotel || hotel.ownerId !== Number(session.user.id)) {
    return null;
  }

  // Room images
  const images = await db
    .select({
      imageUrl: roomImagesTable.imageUrl,
      publicId: roomImagesTable.publicId,
    })
    .from(roomImagesTable)
    .where(eq(roomImagesTable.roomId, roomId));

  // Selected facilities
  const facilities = await db
    .select({
      facilityId: roomFacilitiesTable.facilityId,
    })
    .from(roomFacilitiesTable)
    .where(eq(roomFacilitiesTable.roomId, roomId));

 return {
  roomNumber: room.roomNumber,
  roomType: room.roomType,
  description: room.description,
  pricePerNight: Number(room.pricePerNight),
  capacity: room.capacity,
  status: room.status,

  facilityIds: facilities.map((f) => f.facilityId),

  imageUrls: images,
};
}