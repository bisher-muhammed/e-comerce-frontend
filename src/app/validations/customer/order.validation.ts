import { z } from "zod";

export const orderIdSchema = z.object({
    orderId: z.number().int().positive(),
});

export const orderItemParamsSchema = z.object({
    orderId: z.number().int().positive(),
    itemId: z.number().int().positive(),
});

export const listOrdersSchema = z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(50),

    status: z
        .enum(["PENDING", "CONFIRMED", "CANCELLED", "DELIVERED"])
        .optional(),

    search: z.string().trim().min(1).max(100).optional(),

    dateField: z.enum(["createdAt", "updatedAt"]).optional(),
    startDate: z.string().optional(), // ISO string; backend coerces to Date
    endDate: z.string().optional(),
});

export const cancelOrderSchema = z.object({
    orderId: z.number().int().positive(),
    idempotencyKey: z.string().min(1),
});

export const cancelOrderItemSchema = z.object({
    orderId: z.number().int().positive(),
    itemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    idempotencyKey: z.string().min(1),
});

export const returnOrderItemSchema = z.object({
    orderId: z.number().int().positive(),
    itemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    reason: z.string().trim().min(5, "Return reason must be at least 5 characters").max(500),
    idempotencyKey: z.string().min(1),
});

export const verifyPaymentSchema = z.object({
    orderId: z.number().int().positive(),
    razorpayPaymentId: z.string().trim().min(1),
    razorpaySignature: z.string().trim().min(1),
});

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "DELIVERED";
export type PaymentMethod = "COD" | "ONLINE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
