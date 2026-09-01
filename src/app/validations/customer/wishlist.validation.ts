import { z } from "zod";

export const addWishlistItemSchema = z.object({
  productId: z
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be greater than 0"),
});

export type AddWishlistItemInput = z.infer<
  typeof addWishlistItemSchema
>;
