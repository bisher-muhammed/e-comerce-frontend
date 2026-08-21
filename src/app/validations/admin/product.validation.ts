import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;


export const newProductImageSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Please select an image",
    })
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    )
    .refine(
      (file) => file.size <= MAX_IMAGE_SIZE,
      "Image must be smaller than 5MB"
    ),

  altText: z
    .string()
    .trim()
    .max(255, "Alt text is too long")
    .optional()
    .or(z.literal("")),

  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order cannot be negative")
    .default(0),

  isPrimary: z.boolean().default(false),
});

export const existingProductImageSchema = z.object({
  existing: z.literal(true),

  id: z
    .number()
    .int()
    .positive("Invalid image ID"),

  altText: z
    .string()
    .trim()
    .max(255, "Alt text is too long")
    .optional()
    .or(z.literal("")),

  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order cannot be negative")
    .default(0),

  isPrimary: z.boolean().default(false),
});

export const productImageSchema = z.union([
  existingProductImageSchema,
  newProductImageSchema,
]);


export const productVariantSchema = z.object({
  sizeId: z.number().int().positive("Invalid size"),

  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(99999999.99, "Price is too high")
    .refine(
      (val) => Math.abs(Math.round(val * 100) - val * 100) < 1e-9,
      "Price can have at most 2 decimal places"
    ),

  stock: z.number().int().min(0, "Stock cannot be negative"),
});


const applyColorRefinements = (
  color: {
    variants: { sizeId: number }[];
    images: { isPrimary?: boolean }[];
  },
  ctx: z.RefinementCtx
) => {
  const sizeIds = color.variants.map((variant) => variant.sizeId);

  if (new Set(sizeIds).size !== sizeIds.length) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: "Duplicate sizes are not allowed for the same color",
    });
  }


  const primaryCount = color.images.filter(
    (image) => image.isPrimary
  ).length;

  if (primaryCount !== 1) {
    ctx.addIssue({
      code: "custom",
      path: ["images"],
      message: "Each color must have exactly one primary image",
    });
  }
};

const noDuplicateColorIds = (
  colors: { colorId: number }[],
  ctx: z.RefinementCtx
) => {
  const colorIds = colors.map((color) => color.colorId);

  if (new Set(colorIds).size !== colorIds.length) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Duplicate colors are not allowed",
    });
  }
};


export const createProductColorSchema = z
  .object({
    colorId: z.number().int().positive("Invalid color"),

    images: z
      .array(newProductImageSchema)
      .min(1, "At least one image is required for each color")
      .max(10, "Maximum 10 images allowed per color"),

    variants: z
      .array(productVariantSchema)
      .min(1, "At least one size variant is required for each color")
      .max(50, "Maximum 50 variants allowed per color"),
  })
  .superRefine(applyColorRefinements);

export const updateProductColorSchema = z
  .object({
    colorId: z.number().int().positive("Invalid color"),

    images: z
      .array(productImageSchema)
      .min(1, "At least one image is required for each color")
      .max(10, "Maximum 10 images allowed per color"),

    variants: z
      .array(productVariantSchema)
      .min(1, "At least one size variant is required for each color")
      .max(50, "Maximum 50 variants allowed per color"),
  })
  .superRefine(applyColorRefinements);


export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name is too long"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(200, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),

  details: z
    .string()
    .trim()
    .max(5000, "Product details are too long")
    .optional()
    .or(z.literal("")),

  categoryId: z
    .number()
    .int()
    .positive("Please select a category"),

  isActive: z.boolean().default(true),

  colors: z
    .array(createProductColorSchema)
    .min(1, "At least one color is required")
    .max(20, "Maximum 20 colors allowed per product")
    .superRefine(noDuplicateColorIds),
});


export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name is too long")
    .optional(),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(200, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),

  details: z
    .string()
    .trim()
    .max(5000, "Product details are too long")
    .optional()
    .or(z.literal("")),

  categoryId: z
    .number()
    .int()
    .positive("Please select a category")
    .optional(),

  isActive: z.boolean().optional(),

  colors: z
    .array(updateProductColorSchema)
    .min(1, "At least one color is required")
    .max(20, "Maximum 20 colors allowed per product")
    .superRefine(noDuplicateColorIds)
    .optional(),
});


export const productIdSchema = z.object({
  id: z.coerce.number().int().positive("Invalid product ID"),
});



export type NewProductImageFormData = z.infer<
  typeof newProductImageSchema
>;

export type ExistingProductImageFormData = z.infer<
  typeof existingProductImageSchema
>;

export type ProductImageFormData = z.infer<typeof productImageSchema>;

export type ProductVariantFormData = z.infer<
  typeof productVariantSchema
>;

export type CreateProductColorFormData = z.infer<
  typeof createProductColorSchema
>;

export type UpdateProductColorFormData = z.infer<
  typeof updateProductColorSchema
>;

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
export type ProductIdData = z.infer<typeof productIdSchema>;
