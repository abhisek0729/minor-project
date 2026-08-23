"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { guidesTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/app/types/api";
import {
  guideOnboardingSchema,
  GuideOnboardingData,
} from "../schemas/guide.schema";
import { getGuideByUserId } from "../services/guide.service";

export async function submitGuideOnboarding(
  data: GuideOnboardingData
): Promise<ApiResponse<null>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const roles = session.user.roles ?? [];
    const isGuide = roles.some((role) => role.name === "guide" || role.name === "admin");

    if (!isGuide) {
      return { success: false, message: "Forbidden: Not a tour guide account" };
    }

    const existingGuide = await getGuideByUserId(Number(session.user.id));
    if (existingGuide) {
      return { success: false, message: "Guide profile already registered" };
    }

    const validationResult = guideOnboardingSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validated = validationResult.data;

    await db.insert(guidesTable).values({
      userId: Number(session.user.id),
      name: validated.name.trim(),
      phoneNumber: validated.phoneNumber.trim(),
      location: validated.location.trim(),
      experienceYears: validated.experienceYears,
      languages: validated.languages.trim(),
      dailyRate: validated.dailyRate,
      licenseNumber: validated.licenseNumber ? validated.licenseNumber.trim() : null,
      description: validated.description.trim(),
      guideImageUrl: validated.guideImageUrl.trim(),
      isAvailable: true,
    });

    return {
      success: true,
      message: "Tour Guide profile registered successfully!",
    };
  } catch (error: any) {
    console.error("Guide Onboarding Error:", error);
    return {
      success: false,
      message: error?.message || "Failed to submit guide onboarding",
    };
  }
}
