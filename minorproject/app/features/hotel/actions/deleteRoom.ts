"use server";

import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import cloudinary from "@/app/lib/claudinary";
import { db } from "@/app/lib/db";
import {
  hotelsTable,
  roomImagesTable,
  roomsTable,
} from "@/app/lib/db/schema";

export async function deleteRoom(roomId: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    // Find the room
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

    // Verify ownership
    const [hotel] = await db
      .select({
        id: hotelsTable.id,
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
        message: "You are not authorized to delete this room.",
      };
    }

    // Get all room images
    const images = await db
      .select({
        publicId: roomImagesTable.public_id,
      })
      .from(roomImagesTable)
      .where(eq(roomImagesTable.room_id, roomId));

    // Delete images from Cloudinary
    await Promise.all(
      images.map(({ publicId }) =>
        cloudinary.uploader.destroy(publicId)
      )
    );

    // Delete room
    // room_images and room_facilities will be deleted automatically
    // if their foreign keys use ON DELETE CASCADE.
    await db
      .delete(roomsTable)
      .where(eq(roomsTable.id, roomId));

    return {
      success: true,
      message: "Room deleted successfully.",
    };
  } catch (error) {
    console.error("Delete room error:", error);

    return {
      success: false,
      message: "Something went wrong while deleting the room.",
    };
  }
}