"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ApiResponse } from "@/app/types/api";
import { restaurantOnboardingSchema, RestaurantOnboardingData } from "../schemas/restaurant.schema";
import { checkHasRestaurant, createRestaurant } from "../services/restaurant.service";

export async function submitRestaurantOnboarding(
  data: RestaurantOnboardingData
): Promise<ApiResponse<null>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const roles = session.user.roles ?? [];
    const isOwner = roles.some((role) => role.name === "restaurantOwner");
    
    if (!isOwner) {
      return { success: false, message: "Forbidden: Not a restaurant owner" };
    }

    const hasAlreadyOnboarded = await checkHasRestaurant(Number(session.user.id));
    if (hasAlreadyOnboarded) {
      return { success: false, message: "Restaurant already registered" };
    }

    const validationResult = restaurantOnboardingSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    await createRestaurant(Number(session.user.id), validationResult.data);

    return { success: true, message: "Restaurant onboarded successfully" };
  } catch (error) {
    console.error("Restaurant Onboarding Error:", error);
    return { success: false, message: "Internal server error" };
  }
}