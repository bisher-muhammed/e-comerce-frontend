// validations/customer/cart.validation.ts

import { z } from "zod";

export const addToCartSchema = z.object({
  productVariantId: z
    .number()
    .int("Product variant ID must be an integer")
    .positive("Invalid product variant"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

export type AddToCartInput = z.infer<
  typeof addToCartSchema
>;

export type UpdateCartItemInput = z.infer<
  typeof updateCartItemSchema
>;
