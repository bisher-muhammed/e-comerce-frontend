import { z } from "zod";

export const createSizeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Size name is required")
    .max(50, "Size name is too long")
    .transform((value) => value.toUpperCase()),

  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order cannot be negative")
    .default(0),
});

export const updateSizeSchema = createSizeSchema.partial();

export type CreateSizeFormInput =
  z.input<typeof createSizeSchema>;

export type CreateSizeFormData =
  z.output<typeof createSizeSchema>;

export type UpdateSizeFormData =
  z.infer<typeof updateSizeSchema>;


  