import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 100 characters." })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address." }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(50, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number.",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character.",
    }),

  role: z.enum(
    ["tourist", "hotelOwner", "restaurantOwner", "guide"],
    {
      message: "Please select a valid role.",
    }
  ),
});


export const verifySchema = z.object({
  code: z
    .string()
    .length(6, { message: "Verification code must be 6 characters long" })
    .regex(/^\d+$/, { message: "Verification code must contain only numbers" }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;