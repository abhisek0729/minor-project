import { z } from "zod";

export const guideOnboardingSchema = z.object({
  name: z.string().min(2, "Full name is required").max(255),
  phoneNumber: z.string().min(10, "Valid phone number is required").max(255),
  location: z.string().min(2, "Base location / city is required").max(255),
  experienceYears: z.number().min(0, "Experience years must be 0 or more").default(1),
  languages: z.string().min(2, "Spoken languages are required").default("Nepali, English"),
  dailyRate: z.number().min(500, "Daily rate must be at least NPR 500").default(2500),
  licenseNumber: z.string().optional().default(""),
  description: z.string().min(10, "Bio must be at least 10 characters").max(2000),
  guideImageUrl: z.string().min(1, "Guide profile photo is required"),
});

export type GuideOnboardingData = z.infer<typeof guideOnboardingSchema>;
