"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import {
  hotelFacilitiesTable,
  hotelImagesTable,
  hotelsTable,
  rolesTable,
  userRolesTable,
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
        userId: Number(session.user.id),
        name: data.hotelName,
        description: data.description,
        establishedYear: data.establishedYear,
        phoneNumber: data.phone,
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

    // Ensure user has hotelOwner role recorded and approved if admin
    const [role] = await tx
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, "hotelOwner"));

    if (role) {
      const [existingUserRole] = await tx
        .select()
        .from(userRolesTable)
        .where(
          and(
            eq(userRolesTable.userId, Number(session.user.id)),
            eq(userRolesTable.roleId, role.id)
          )
        );

      const isAdmin = session.user.roles?.some((r: any) => r.name === "admin");
      const status = isAdmin ? "approved" : (existingUserRole?.approvalStatus || "approved");

      if (!existingUserRole) {
        await tx.insert(userRolesTable).values({
          userId: Number(session.user.id),
          roleId: role.id,
          approvalStatus: status,
        });
      } else if (isAdmin && existingUserRole.approvalStatus !== "approved") {
        await tx
          .update(userRolesTable)
          .set({ approvalStatus: "approved" })
          .where(
            and(
              eq(userRolesTable.userId, Number(session.user.id)),
              eq(userRolesTable.roleId, role.id)
            )
          );
      }
    }
  });

  return {
    success: true,
  };
}