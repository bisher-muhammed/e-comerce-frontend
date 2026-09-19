import { z } from "zod";

export const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
] as const;

export const PAYMENT_METHODS = ["COD", "ONLINE"] as const;

export const PAYMENT_STATUSES = [
    "PENDING",
    "PAID",
    "FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const calendarDateSchema = z
    .string()
    .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Dates must be in YYYY-MM-DD format"
    );

// ============================================================
// ORDER PARAMS
// ============================================================

export const orderIdSchema = z.object({
    orderId: z.number().int().positive(),
});

// ============================================================
// LIST ORDERS
// ============================================================

export const listOrdersSchema = z.object({
    page: z.number().int().min(1),

    limit: z
        .number()
        .int()
        .min(1)
        .max(50),

    status: z.enum(ORDER_STATUSES).optional(),

    search: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    dateField: z
        .enum(["createdAt", "updatedAt"])
        .optional(),

    startDate: calendarDateSchema.optional(),

    endDate: calendarDateSchema.optional(),
});

// ============================================================
// ORDER-LEVEL CANCEL
// ============================================================

export const cancelOrderSchema = z.object({
    orderId: z
        .number()
        .int()
        .positive(),

    idempotencyKey: z
        .string()
        .trim()
        .min(1),

    reason: z
        .string()
        .trim()
        .min(5, "Cancellation reason must be at least 5 characters")
        .max(500)
        .optional(),
});

// ============================================================
// ITEM-LEVEL CANCEL
// ============================================================

export const cancelOrderItemSchema = z.object({
    orderId: z
        .number()
        .int()
        .positive(),

    itemId: z
        .number()
        .int()
        .positive(),

    quantity: z
        .number()
        .int()
        .positive(),

    idempotencyKey: z
        .string()
        .trim()
        .min(1),

    reason: z
        .string()
        .trim()
        .min(5, "Cancellation reason must be at least 5 characters")
        .max(500)
        .optional(),
});

// ============================================================
// ITEM-LEVEL RETURN
// ============================================================

export const returnOrderItemSchema = z.object({
    orderId: z
        .number()
        .int()
        .positive(),

    itemId: z
        .number()
        .int()
        .positive(),

    quantity: z
        .number()
        .int()
        .positive(),

    reason: z
        .string()
        .trim()
        .min(5, "Return reason must be at least 5 characters")
        .max(500),

    idempotencyKey: z
        .string()
        .trim()
        .min(1),
});
