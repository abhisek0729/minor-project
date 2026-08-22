import { db } from "@/app/lib/db";
import { menusTable, restaurantImagesTable, restaurantsTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

type RestaurantOnboardingData = {
  name: string;
  description: string;
  establishedDate?: string;
  cuisine?: string;
  phoneNumber: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  street: string;
  restaurantImageUrl: string;
  galleryImages?: { imageUrl: string; publicId?: string }[];
};

export const checkHasRestaurant = async (userId: number): Promise<boolean> => {
  const [existing] = await db
    .select({ id: restaurantsTable.id })
    .from(restaurantsTable)
    .where(eq(restaurantsTable.userId, userId));

  return !!existing;
};

export const createRestaurant = async (
  userId: number,
  data: RestaurantOnboardingData
) => {
  return await db.transaction(async (tx) => {
    const [newRestaurant] = await tx
      .insert(restaurantsTable)
      .values({
        userId: userId,
        name: data.name,
        description: data.description,
        establishedDate: data.establishedDate || null,
        cuisine: data.cuisine || "Multi-Cuisine",
        phoneNumber: data.phoneNumber,
        location: `${data.street}, Ward ${data.ward}, ${data.municipality}, ${data.district}, ${data.province}`,
        restaurantImageUrl: data.restaurantImageUrl,
      })
      .returning();

    if (data.galleryImages && data.galleryImages.length > 0) {
      await tx.insert(restaurantImagesTable).values(
        data.galleryImages.map((img) => ({
          restaurantId: newRestaurant.id,
          imageUrl: img.imageUrl,
          publicId: img.publicId || "",
        }))
      );
    }

    return newRestaurant;
  });
};

export const getRestaurantByOwnerId = async (userId: number) => {
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.userId, userId));

  return restaurant ?? null;
};

export const getRestaurants = async () => {
  return db
    .select({
      id: restaurantsTable.id,
      name: restaurantsTable.name,
      description: restaurantsTable.description,
      cuisine: restaurantsTable.cuisine,
      location: restaurantsTable.location,
      phoneNumber: restaurantsTable.phoneNumber,
      imageUrl: restaurantsTable.restaurantImageUrl,
      isOpen: restaurantsTable.isOpen,
      openingTime: restaurantsTable.openingTime,
      closingTime: restaurantsTable.closingTime,
    })
    .from(restaurantsTable);
};

export const getRestaurantById = async (id: number) => {
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, id));

  return restaurant ?? null;
};

export const getRestaurantMenu = async (restaurantId: number) => {
  return db
    .select()
    .from(menusTable)
    .where(eq(menusTable.restaurantId, restaurantId));
};