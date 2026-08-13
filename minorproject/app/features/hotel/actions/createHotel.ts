"use server";

import { db } from "@/app/lib/db";
import {
  hotelFacilitiesTable,
  hotelImagesTable,
  hotelsTable,
} from "@/app/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { HotelSchema } from "../schemas/hotel.schema";

export async function createHotel(data: HotelSchema) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await db.transaction(async (tx) => {
    const [hotel] = await tx
      .insert(hotelsTable)
      .values({
        user_id: Number(session.user.id),
        name: data.hotelName,
        description: data.description,
        establishedYear: data.establishedYear,
        phone_number: data.phone,
        website: data.website,
        province: data.province,
        district: data.district,
        municipality: data.municipality,
        ward: data.ward,
        street: data.street,
        latitude: data.latitude,
        longitude: data.longitude,
        coverImageUrl: data.coverImage.imageUrl,
        coverImagePublicId: data.coverImage.publicId,
      })
      .returning({ id: hotelsTable.id });

    if (data.galleryImages.length > 0) {
      await tx.insert(hotelImagesTable).values(
        data.galleryImages.map((image : {imageUrl : string, publicId : string}) => ({
          hotelId: hotel.id,
          imageUrl: image.imageUrl,
          publicId: image.publicId,
        })),
      );
    }

    if (data.facilities.length > 0) {
      await tx.insert(hotelFacilitiesTable).values(
        data.facilities.map((facilityId) => ({
          hotelId: hotel.id,
          facilityId,
        })),
      );
    }
  });

  return {
    success: true,
  };
}