import { z } from "zod";

export const hotelSchema = z.object({
  // Step 1 - Basic Information
  hotelName: z.string().min(3, "Hotel name must be at least 3 characters"),

  description: z.string().min(20, "Description must be at least 20 characters"),

  establishedYear: z.coerce
    .number()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  // Step 2 - Contact Information
  phone: z.string().min(10, "Phone number is required"),

  email: z.string().email("Invalid email").optional(),

  website: z.string().url("Invalid website URL").or(z.literal("")).optional(),

  // Step 3 - Location
  province: z.string().min(1, "Province is required"),

  district: z.string().min(1, "District is required"),

  municipality: z.string().min(1, "Municipality is required"),

  ward: z.string().min(1, "Ward is required"),

  street: z.string().min(1, "Street is required"),

  latitude: z.coerce.number().optional(),

  longitude: z.coerce.number().optional(),

  // Step 4 - Facilities
  facilities: z.array(z.number()).default([]),

  // Step 5 - Images
  coverImage: z.object({
    imageUrl: z.string().min(1),
    publicId: z.string().min(1),
  }),

  galleryImages: z.array(
    z.object({
      imageUrl: z.string().min(1),
      publicId: z.string().min(1),
    }),
  ),
});

export type HotelSchema = z.infer<typeof hotelSchema>;
