import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Item name must be at least 2 characters."),
  description: z.string().trim().min(5, "Description must be at least 5 characters."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  category: z.string().trim().min(2, "Please select or enter a category."),
  menusImageUrl: z.string().min(1, "Please provide an image for the food item."),
  isAvailable: z.boolean().default(true),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

export const restaurantHoursSchema = z.object({
  isOpen: z.boolean(),
  openingTime: z.string().min(1, "Opening time is required"),
  closingTime: z.string().min(1, "Closing time is required"),
});

export type RestaurantHoursInput = z.infer<typeof restaurantHoursSchema>;
