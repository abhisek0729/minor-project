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
        hotelId: roomsTable.hotelId,
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
        ownerId: hotelsTable.userId,
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
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          description: data.description,
          pricePerNight: data.pricePerNight.toString(),
          capacity: data.capacity,
          status: data.status,
          updatedAt: new Date(),
        })
        .where(eq(roomsTable.id, roomId));

      // Replace facilities
      await tx
        .delete(roomFacilitiesTable)
        .where(eq(roomFacilitiesTable.roomId, roomId));

      if (data.facilityIds.length > 0) {
        await tx.insert(roomFacilitiesTable).values(
          data.facilityIds.map((facilityId : number) => ({
            roomId: roomId,
            facilityId: facilityId,
          }))
        );
      }

      // Replace images
      await tx
        .delete(roomImagesTable)
        .where(eq(roomImagesTable.roomId, roomId));

      if (data.imageUrls.length > 0) {
        await tx.insert(roomImagesTable).values(
          data.imageUrls.map((image:{imageUrl : string, publicId : string}) => ({
            roomId: roomId,
            imageUrl: image.imageUrl,
            publicId: image.publicId,
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