import { z } from "zod";

export const createAdminSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, "First name is required"),

    lastName: z
      .string()
      .trim()
      .optional(),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        8,
        "Please confirm your password"
      ),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type CreateAdminInput = z.infer<
  typeof createAdminSchema
>;