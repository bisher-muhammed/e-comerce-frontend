import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name is too long"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean(),
});

export const updateCategorySchema =
  createCategorySchema.partial();

export type CreateCategoryFormData =
  z.infer<typeof createCategorySchema>;

export type UpdateCategoryFormData =
  z.infer<typeof updateCategorySchema>;
  