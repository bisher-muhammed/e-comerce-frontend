import { z } from "zod";

export const createColorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Color name must be at least 2 characters")
    .max(50, "Color name is too long"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  hexCode: z
    .string()
    .trim()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Hex code must be in the format #RRGGBB"
    )
    .optional()
    .or(z.literal("")),
});

export const updateColorSchema =
  createColorSchema.partial();

export type CreateColorFormData =
  z.infer<typeof createColorSchema>;

export type UpdateColorFormData =
  z.infer<typeof updateColorSchema>;


  