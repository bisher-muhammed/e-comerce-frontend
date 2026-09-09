import { z } from "zod";

export const customerFilterSchema = z.object({
  search: z.string().trim().optional(),

  status: z
    .enum([
      "PENDING_VERIFICATION",
      "ACTIVE",
      "SUSPENDED",
      "DEACTIVATED",
    ])
    .optional(),

  page: z.number().int().min(1),

  limit: z.number().int().min(1).max(100),
});