import apiPrivate from "@/app/lib/api/apiPrivate";

import {
    orderIdSchema,
    listOrdersSchema,
    cancelOrderSchema,
    cancelOrderItemSchema,
    returnOrderItemSchema,
    verifyPaymentSchema,
    type OrderStatus,
    type PaymentMethod,
    type PaymentStatus,
} from "@/app/validations/customer/order.validation";

// ============================================================
// API RESPONSE
// ============================================================

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

// ============================================================
// TYPES
// ============================================================

export interface OrderListItem {
    id: number;

    status: OrderStatus;

    paymentMethod: PaymentMethod;

    paymentStatus: PaymentStatus;

    subtotal: string;

    total: string;

    // Meaningful mainly for PENDING + ONLINE orders.
    expiresAt: string | null;

    createdAt: string;

    updatedAt: string;

    _count: {
        items: number;
    };
}

export interface OrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface OrderListResponse {
    orders: OrderListItem[];
    pagination: OrderPagination;
}

// ============================================================
// ORDER IMAGE
// ============================================================

export interface OrderImage {
    url: string;
    altText: string | null;
}

// ============================================================
// ORDER ITEM
// ============================================================

export interface OrderItem {
    id: number;

    productVariantId: number;

    productName: string;

    colorName: string;

    sizeName: string;

    // Historical price captured when order was created.
    price: string;

    // Original quantity purchased.
    quantity: number;

    // Current quantity still active.
    //
    // This decreases when:
    // - cancelled
    // - returned
    remainingQuantity: number;

    // Quantity cancelled from this item.
    cancelledQuantity: number;

    // Quantity returned from this item.
    returnedQuantity: number;

    createdAt: string;

    productVariant: {
        productColor: {
            images: OrderImage[];
        };
    };
}



export interface OrderItemMutationResult {
    id: number;

    remainingQuantity: number;

    cancelledQuantity: number;

    returnedQuantity: number;

    updatedAt: string;
}

// ============================================================
// ORDER DETAILS
// ============================================================

export interface OrderDetails {
    id: number;

    status: OrderStatus;

    paymentMethod: PaymentMethod;

    paymentStatus: PaymentStatus;

    // ========================================================
    // CONTACT SNAPSHOT
    // ========================================================

    contactEmail: string;

    contactPhone: string;

    // ========================================================
    // SHIPPING SNAPSHOT
    // ========================================================

    shippingFirstName: string;

    shippingLastName: string | null;

    shippingPhone: string;

    shippingLine1: string;

    shippingLine2: string | null;

    shippingCity: string;

    shippingState: string;

    shippingPostalCode: string;

    shippingCountry: string;

    // ========================================================
    // FINANCIAL VALUES
    // ========================================================

    subtotal: string;

    total: string;

    // Amount removed from the order because of cancellation.
    cancelledAmount: string;

    // Actual refund amount recorded by the refund process.
    refundedAmount: string;

    // ========================================================
    // CANCELLATION
    // ========================================================

    cancellationReason: string | null;

    // ========================================================
    // PAYMENT WINDOW
    // ========================================================

    // Relevant mainly for PENDING + ONLINE.
    expiresAt: string | null;

    // ========================================================
    // TIMESTAMPS
    // ========================================================

    createdAt: string;

    updatedAt: string;

    // ========================================================
    // ITEMS
    // ========================================================

    items: OrderItem[];
}

// ============================================================
// IDEMPOTENCY KEY
// ============================================================
//
// Generate this ONCE when the user starts an action.
//
// Example:
//
// const key = newIdempotencyKey();
//
// await cancelOrder(orderId, key, reason);
//
// If the same request must be retried, reuse `key`.
//
// DO NOT generate a new key for every retry.
//

export function newIdempotencyKey(): string {
    return crypto.randomUUID();
}

// ============================================================
// GET ORDERS
// ============================================================

export interface GetOrdersOptions {
    status?: OrderStatus;

    search?: string;

    dateField?: "createdAt" | "updatedAt";

    startDate?: string;

    endDate?: string;
}

export async function getOrders(
    page = 1,
    limit = 10,
    options: GetOrdersOptions = {}
): Promise<OrderListResponse> {
    const params = listOrdersSchema.parse({
        page,
        limit,

        status: options.status,

        search: options.search,

        dateField: options.dateField,

        startDate: options.startDate,

        endDate: options.endDate,
    });

    const response =
        await apiPrivate.get<
            ApiResponse<OrderListResponse>
        >(
            "/customer/orders",
            {
                params,
            }
        );

    return response.data.data;
}

// ============================================================
// GET ORDER BY ID
// ============================================================

export async function getOrderById(
    orderId: number
): Promise<OrderDetails> {
    const { orderId: validOrderId } =
        orderIdSchema.parse({
            orderId,
        });

    const response =
        await apiPrivate.get<
            ApiResponse<OrderDetails>
        >(
            `/customer/orders/${validOrderId}`
        );

    return response.data.data;
}

// ============================================================
// ORDER-LEVEL CANCEL
// ============================================================
//
// Backend:
//
// PATCH /customer/orders/:orderId/cancel
//
// Body:
// {
//     idempotencyKey,
//     reason?
// }
//
// Backend returns:
//
// OrderDetails
//

export async function cancelOrder(
    orderId: number,
    idempotencyKey: string,
    reason?: string
): Promise<OrderDetails> {
    const data = cancelOrderSchema.parse({
        orderId,
        idempotencyKey,
        reason,
    });

    const response =
        await apiPrivate.patch<
            ApiResponse<OrderDetails>
        >(
            `/customer/orders/${data.orderId}/cancel`,
            {
                idempotencyKey:
                    data.idempotencyKey,

                reason: data.reason,
            }
        );

    return response.data.data;
}

// ============================================================
// ITEM-LEVEL CANCEL
// ============================================================
//
// Backend:
//
// PATCH /customer/orders/:orderId/items/:itemId/cancel
//
// Body:
// {
//     quantity,
//     idempotencyKey,
//     reason?
// }
//
// Backend returns:
//
// OrderItemMutationResult
//

export async function cancelOrderItem(
    orderId: number,
    itemId: number,
    quantity: number,
    idempotencyKey: string,
    reason?: string
): Promise<OrderItemMutationResult> {
    const data =
        cancelOrderItemSchema.parse({
            orderId,
            itemId,
            quantity,
            idempotencyKey,
            reason,
        });

    const response =
        await apiPrivate.patch<
            ApiResponse<OrderItemMutationResult>
        >(
            `/customer/orders/${data.orderId}/items/${data.itemId}/cancel`,
            {
                quantity: data.quantity,

                idempotencyKey:
                    data.idempotencyKey,

                reason: data.reason,
            }
        );

    return response.data.data;
}

// ============================================================
// ITEM-LEVEL RETURN
// ============================================================
//
// Backend:
//
// POST /customer/orders/:orderId/items/:itemId/return
//
// Body:
// {
//     quantity,
//     reason,
//     idempotencyKey
// }
//
// Backend returns:
//
// OrderItemMutationResult
//

export async function returnOrderItem(
    orderId: number,
    itemId: number,
    quantity: number,
    reason: string,
    idempotencyKey: string
): Promise<OrderItemMutationResult> {
    const data =
        returnOrderItemSchema.parse({
            orderId,
            itemId,
            quantity,
            reason,
            idempotencyKey,
        });

    const response =
        await apiPrivate.post<
            ApiResponse<OrderItemMutationResult>
        >(
            `/customer/orders/${data.orderId}/items/${data.itemId}/return`,
            {
                quantity: data.quantity,

                reason: data.reason,

                idempotencyKey:
                    data.idempotencyKey,
            }
        );

    return response.data.data;
}

// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================
//
// Backend:
//
// POST /customer/orders/:orderId/verify-payment
//
// Body:
// {
//     razorpayPaymentId,
//     razorpaySignature
// }
//
// Backend returns:
//
// OrderDetails
//

export async function verifyPayment(
    orderId: number,
    razorpayPaymentId: string,
    razorpaySignature: string
): Promise<OrderDetails> {
    const data =
        verifyPaymentSchema.parse({
            orderId,
            razorpayPaymentId,
            razorpaySignature,
        });

    const response =
        await apiPrivate.post<
            ApiResponse<OrderDetails>
        >(
            `/customer/orders/${data.orderId}/verify-payment`,
            {
                razorpayPaymentId:
                    data.razorpayPaymentId,

                razorpaySignature:
                    data.razorpaySignature,
            }
        );

    return response.data.data;
}