import { z } from "zod";

// ============================================================
// ORDER PARAMS
// ============================================================

export const orderIdSchema = z.object({
    orderId: z.number().int().positive(),
});

export const orderItemParamsSchema = z.object({
    orderId: z.number().int().positive(),
    itemId: z.number().int().positive(),
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

    status: z
        .enum([
            "PENDING",
            "CONFIRMED",
            "CANCELLED",
            "DELIVERED",
        ])
        .optional(),

    search: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    dateField: z
        .enum(["createdAt", "updatedAt"])
        .optional(),

    // ISO date strings.
    // Backend converts these into Date objects.
    startDate: z.string().optional(),

    endDate: z.string().optional(),
});

// ============================================================
// ORDER-LEVEL CANCEL
// ============================================================

export const cancelOrderSchema = z.object({
    orderId: z.number().int().positive(),

    idempotencyKey: z
        .string()
        .trim()
        .min(1),

    // Backend accepts optional reason.
    reason: z
        .string()
        .trim()
        .max(500)
        .optional(),
});

// ============================================================
// ITEM-LEVEL CANCEL
// ============================================================

export const cancelOrderItemSchema = z.object({
    orderId: z.number().int().positive(),

    itemId: z.number().int().positive(),

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
        .max(500)
        .optional(),
});

// ============================================================
// ITEM-LEVEL RETURN
// ============================================================

export const returnOrderItemSchema = z.object({
    orderId: z.number().int().positive(),

    itemId: z.number().int().positive(),

    quantity: z
        .number()
        .int()
        .positive(),

    // Backend requires a non-empty return reason.
    reason: z
        .string()
        .trim()
        .min(
            5,
            "Return reason must be at least 5 characters"
        )
        .max(500),

    idempotencyKey: z
        .string()
        .trim()
        .min(1),
});

// ============================================================
// VERIFY PAYMENT
// ============================================================

export const verifyPaymentSchema = z.object({
    orderId: z.number().int().positive(),

    razorpayPaymentId: z
        .string()
        .trim()
        .min(1),

    razorpaySignature: z
        .string()
        .trim()
        .min(1),
});

// ============================================================
// TYPES
// ============================================================

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "DELIVERED";

export type PaymentMethod =
    | "COD"
    | "ONLINE";

export type PaymentStatus =
    | "PENDING"
    | "PAID"
    | "FAILED";
