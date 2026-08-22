"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  roomFacilitiesTable,
  roomImagesTable,
  roomsTable,
} from "@/app/lib/db/schema";

import { getHotelByOwnerId } from "./getHotelByOwnerId";
import { RoomSchema } from "../schemas/room.schema";
import { and, eq } from "drizzle-orm";

export async function createRoom(data: RoomSchema) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const hotel = await getHotelByOwnerId(Number(session.user.id));

  if (!hotel) {
    return {
      success: false,
      message: "Hotel not found.",
    };
  }

  const [existingRoom] = await db
    .select({ id: roomsTable.id })
    .from(roomsTable)
    .where(
      and(
        eq(roomsTable.hotelId, hotel.id),
        eq(roomsTable.roomNumber, data.roomNumber),
      ),
    );

  if (existingRoom) {
    console.log("room exists")
    return {
      success: false,
      message: "Room with this room number already exists.",
    };
  }
  
  await db.transaction(async (tx) => {

    const [room] = await tx
      .insert(roomsTable)
      .values({
        hotelId: hotel.id,
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        description: data.description,
        pricePerNight: data.pricePerNight.toString(),
        capacity: data.capacity,
        status: data.status,
      })
      .returning({
        id: roomsTable.id,
      });

    if (data.imageUrls.length > 0) {
      await tx.insert(roomImagesTable).values(
        data.imageUrls.map((image) => ({
          roomId: room.id,
          imageUrl: image.imageUrl,
          publicId: image.publicId,
        })),
      );
    }

    if (data.facilityIds.length > 0) {
      await tx.insert(roomFacilitiesTable).values(
        data.facilityIds.map((facilityId) => ({
          roomId: room.id,
          facilityId: facilityId,
        })),
      );
    }
  });

  return {
    success: true,
    message: "Room added successfully",
  };
}
