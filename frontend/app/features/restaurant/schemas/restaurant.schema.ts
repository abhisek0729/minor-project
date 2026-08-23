import { z } from "zod";

export const basicInfoSchema = z.object({
  name: z.string().min(2, "Restaurant name is required").max(255),
  description: z.string().min(10, "Description must be at least 10 characters").max(255),
  establishedDate: z.string().optional().default(""),
  cuisine: z.string().optional().default("Multi-Cuisine"),
});

export const contactInfoSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required").max(255),
});

export const locationSchema = z.object({
  province: z.string().min(1, "Province is required").max(100),
  district: z.string().min(1, "District is required").max(100),
  municipality: z.string().min(1, "Municipality is required").max(100),
  ward: z.string().min(1, "Ward is required").max(20),
  street: z.string().min(1, "Street is required").max(255),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const imagesSchema = z.object({
  restaurantImageUrl: z.string().url("Restaurant cover image is required"),
  publicId: z.string().optional(),
  galleryImages: z.array(
    z.object({
      imageUrl: z.string().url(),
      publicId: z.string().optional().default(""),
    })
  ).optional().default([]),
});

export const facilitiesSchema = z.object({
  facilities: z.array(z.string()).optional().default([]),
});

export const restaurantOnboardingSchema = z.object({
  ...basicInfoSchema.shape,
  ...contactInfoSchema.shape,
  ...locationSchema.shape,
  ...facilitiesSchema.shape,
  ...imagesSchema.shape,
});

export type RestaurantOnboardingData = z.infer<typeof restaurantOnboardingSchema>;