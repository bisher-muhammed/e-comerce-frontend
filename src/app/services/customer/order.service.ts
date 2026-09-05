import apiPrivate from "@/app/lib/api/apiPrivate";

import {
    orderIdSchema,
    orderItemParamsSchema,
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
// TYPES
// ============================================================

export interface OrderListItem {
    id: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    subtotal: string;
    total: string;
    createdAt: string;
    updatedAt: string;
    _count: { items: number };
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

export interface OrderImage {
    url: string;
    altText: string | null;
}

export interface OrderItem {
    id: number;
    productVariantId: number;

    productName: string;
    colorName: string;
    sizeName: string;

    price: string;

    // Immutable original quantity, for display/receipts.
    quantity: number;

    // Mutable — what's actually cancel/return-eligible right now.
    remainingQuantity: number;
    cancelledQuantity: number;
    returnedQuantity: number;

    createdAt: string;

    productVariant: {
        productColor: {
            images: OrderImage[];
        };
    };
}

export interface OrderDetails {
    id: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;

    shippingFirstName: string;
    shippingLastName: string | null;
    shippingPhone: string;
    shippingLine1: string;
    shippingLine2: string | null;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingCountry: string;

    subtotal: string;
    total: string;

    createdAt: string;
    updatedAt: string;

    items: OrderItem[];
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

// ============================================================
// IDEMPOTENCY KEY
// ============================================================

// One key per user-initiated action. Callers generate this once per
// click and pass it straight through — do NOT generate a new key on
// each retry, or the server-side dedup guard is pointless.
export function newIdempotencyKey(): string {
    return crypto.randomUUID();
}

// ============================================================
// GET ORDERS — search + date filter
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

    const response = await apiPrivate.get<ApiResponse<OrderListResponse>>(
        "/customer/orders",
        { params }
    );

    return response.data.data;
}

// ============================================================
// GET ORDER DETAILS
// ============================================================

export async function getOrderById(orderId: number): Promise<OrderDetails> {
    const { orderId: validOrderId } = orderIdSchema.parse({ orderId });

    const response = await apiPrivate.get<ApiResponse<OrderDetails>>(
        `/customer/orders/${validOrderId}`
    );

    return response.data.data;
}

// ============================================================
// ORDER-LEVEL CANCEL
// ============================================================

export async function cancelOrder(orderId: number): Promise<OrderDetails> {
    const data = cancelOrderSchema.parse({
        orderId,
        idempotencyKey: newIdempotencyKey(),
    });

    const response = await apiPrivate.patch<ApiResponse<OrderDetails>>(
        `/customer/orders/${data.orderId}/cancel`,
        { idempotencyKey: data.idempotencyKey }
    );

    return response.data.data;
}

// ============================================================
// ITEM-LEVEL CANCEL
// ============================================================

export async function cancelOrderItem(
    orderId: number,
    itemId: number,
    quantity: number
): Promise<OrderItem> {
    const data = cancelOrderItemSchema.parse({
        orderId,
        itemId,
        quantity,
        idempotencyKey: newIdempotencyKey(),
    });

    const response = await apiPrivate.patch<ApiResponse<OrderItem>>(
        `/customer/orders/${data.orderId}/items/${data.itemId}/cancel`,
        { quantity: data.quantity, idempotencyKey: data.idempotencyKey }
    );

    return response.data.data;
}

// ============================================================
// ITEM-LEVEL RETURN
// ============================================================

export async function returnOrderItem(
    orderId: number,
    itemId: number,
    quantity: number,
    reason: string
): Promise<OrderItem> {
    const data = returnOrderItemSchema.parse({
        orderId,
        itemId,
        quantity,
        reason,
        idempotencyKey: newIdempotencyKey(),
    });

    const response = await apiPrivate.post<ApiResponse<OrderItem>>(
        `/customer/orders/${data.orderId}/items/${data.itemId}/return`,
        {
            quantity: data.quantity,
            reason: data.reason,
            idempotencyKey: data.idempotencyKey,
        }
    );

    return response.data.data;
}

// ============================================================
// VERIFY PAYMENT
// ============================================================

export async function verifyPayment(
    orderId: number,
    razorpayPaymentId: string,
    razorpaySignature: string
): Promise<OrderDetails> {
    const data = verifyPaymentSchema.parse({ orderId, razorpayPaymentId, razorpaySignature });

    const response = await apiPrivate.post<ApiResponse<OrderDetails>>(
        `/customer/orders/${data.orderId}/verify-payment`,
        { razorpayPaymentId: data.razorpayPaymentId, razorpaySignature: data.razorpaySignature }
    );

    return response.data.data;
}
