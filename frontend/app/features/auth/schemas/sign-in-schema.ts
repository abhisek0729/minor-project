import { z } from "zod";

export const SignInSchema = z.object({
  identifier: z.email("Please enter a valid email."),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
