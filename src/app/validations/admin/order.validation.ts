import { z } from "zod";

// ============================================================// ENUMS
// ============================================================

export const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "DELIVERED",
] as const;

export const PAYMENT_STATUSES = [
    "PENDING",
    "PAID",
    "FAILED",
] as const;

export const PAYMENT_METHODS = [
    "COD",
    "ONLINE",
] as const;

// ============================================================
// STATUS SCHEMAS
// ============================================================

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export const paymentMethodSchema = z.enum(PAYMENT_METHODS);

// ============================================================
// LIST ORDERS
// ============================================================

export const listOrdersQuerySchema = z.object({
    page: z.number().int().positive(),

    limit: z
        .number()
        .int()
        .positive()
        .max(100),

    status: orderStatusSchema.optional(),

    paymentStatus: paymentStatusSchema.optional(),

    paymentMethod: paymentMethodSchema.optional(),

    search: z
        .string()
        .trim()
        .max(100)
        .optional(),

    sortBy: z.enum([
        "createdAt",
        "total",
        "status",
    ]),

    sortOrder: z.enum([
        "asc",
        "desc",
    ]),
});

// ============================================================
// ORDER ID
// ============================================================

export const orderIdSchema = z
    .number()
    .int()
    .positive();

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatusSchema = z
    .object({
        status: orderStatusSchema,

        reason: z
            .string()
            .trim()
            .max(500)
            .optional(),

        /*
         * Must be supplied by the client.
         *
         * This key is generated once for a status-change attempt
         * and reused if the request needs to be retried.
         */
        idempotencyKey: z
            .string()
            .trim()
            .min(1, "idempotencyKey is required")
            .max(100),
    })
    .superRefine((data, ctx) => {
        if (
            data.status === "CANCELLED" &&
            (!data.reason || data.reason.length < 5)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "A reason of at least 5 characters is required when cancelling an order",
                path: ["reason"],
            });
        }
    });

// ============================================================
// TYPES
// ============================================================

export type OrderStatus = z.infer<
    typeof orderStatusSchema
>;

export type PaymentStatus = z.infer<
    typeof paymentStatusSchema
>;

export type PaymentMethod = z.infer<
    typeof paymentMethodSchema
>;

export type ListOrdersQuery = z.infer<
    typeof listOrdersQuerySchema
>;

export type UpdateOrderStatusInput = z.infer<
    typeof updateOrderStatusSchema
>;