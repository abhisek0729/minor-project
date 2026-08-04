import { z } from "zod";

export const roomTypeEnum = [
  "single",
  "double",
  "twin",
  "family",
  "suite",
] as const;

export const roomStatusEnum = ["available", "maintenance", "inactive"] as const;

export const roomSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number is required")
    .max(20, "Room number cannot exceed 20 characters"),

  roomType: z.enum(roomTypeEnum, {
    error: "Please select a room type",
  }),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),

  pricePerNight: z.coerce
    .number()
    .positive("Price per night must be greater than 0"),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(20, "Capacity cannot exceed 20"),

  status: z.enum(roomStatusEnum),

  facilityIds: z.array(z.number().int()).default([]),

  imageUrls: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        publicId: z.string().min(1),
      }),
    )
    .min(1, "Please upload at least one image"),
});

export type RoomSchema = z.infer<typeof roomSchema>;
