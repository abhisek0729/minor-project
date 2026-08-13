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

import { RoomSchema } from "../schemas/room.schema";

interface UpdateRoomParams {
  roomId: number;
  data: RoomSchema;
}

export async function updateRoom({
  roomId,
  data,
}: UpdateRoomParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const [room] = await db
      .select({
        id: roomsTable.id,
        hotelId: roomsTable.hotel_id,
      })
      .from(roomsTable)
      .where(eq(roomsTable.id, roomId));

    if (!room) {
      return {
        success: false,
        message: "Room not found.",
      };
    }

    const [hotel] = await db
      .select({
        ownerId: hotelsTable.user_id,
      })
      .from(hotelsTable)
      .where(eq(hotelsTable.id, room.hotelId));

    if (!hotel) {
      return {
        success: false,
        message: "Hotel not found.",
      };
    }

    if (hotel.ownerId !== Number(session.user.id)) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    await db.transaction(async (tx) => {
      // Update room
      await tx
        .update(roomsTable)
        .set({
          room_number: data.roomNumber,
          room_type: data.roomType,
          description: data.description,
          price_per_night: data.pricePerNight.toString(),
          capacity: data.capacity,
          status: data.status,
          updated_at: new Date(),
        })
        .where(eq(roomsTable.id, roomId));

      // Replace facilities
      await tx
        .delete(roomFacilitiesTable)
        .where(eq(roomFacilitiesTable.room_id, roomId));

      if (data.facilityIds.length > 0) {
        await tx.insert(roomFacilitiesTable).values(
          data.facilityIds.map((facilityId : number) => ({
            room_id: roomId,
            facility_id: facilityId,
          }))
        );
      }

      // Replace images
      await tx
        .delete(roomImagesTable)
        .where(eq(roomImagesTable.room_id, roomId));

      if (data.imageUrls.length > 0) {
        await tx.insert(roomImagesTable).values(
          data.imageUrls.map((image:{imageUrl : string, publicId : string}) => ({
            room_id: roomId,
            image_url: image.imageUrl,
            public_id: image.publicId,
          }))
        );
      }
    });

    return {
      success: true,
      message: "Room updated successfully.",
    };
  } catch (error) {
    console.error("Update room error:", error);

    return {
      success: false,
      message: "Failed to update room.",
    };
  }
}