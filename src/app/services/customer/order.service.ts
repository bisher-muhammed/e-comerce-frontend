import apiPrivate from "@/app/lib/api/apiPrivate";

import {
    orderIdSchema,
    listOrdersSchema,
    cancelOrderSchema,
    cancelOrderItemSchema,
    returnOrderItemSchema,
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

    couponCode: string | null;

    couponDiscount: string | null;

    total: string;

    expiresAt: string | null;

    createdAt: string;

    updatedAt: string;

    _count: {
        items: number;
    };
}

// ============================================================
// ORDER ITEM IMAGE
// ============================================================

export interface OrderItemImage {
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

    price: string;

    quantity: number;

    remainingQuantity: number;

    cancelledQuantity: number;

    returnedQuantity: number;

    productVariant?: {
        productColor?: {
            images?: OrderItemImage[];
        };
    };
}

export const RETURN_STATUSES = [
    "REQUESTED",
    "APPROVED",
    "REJECTED",
    "RECEIVED",
    "REFUNDED",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export interface ReturnRequest {
    id: number;
    orderId: number;
    orderItemId: number;
    quantity: number;
    reason: string;
    status: ReturnStatus;
    adminNote: string | null;
    refundAmount: string | null;
    decidedAt: string | null;
    receivedAt: string | null;
    refundedAt: string | null;
    createdAt: string;
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

    contactEmail: string;

    contactPhone: string;

    shippingFirstName: string;

    shippingLastName: string | null;

    shippingPhone: string;

    shippingLine1: string;

    shippingLine2: string;

    shippingLandmark: string | null;

    shippingCity: string;

    shippingState: string;

    shippingPostalCode: string;

    shippingCountry: string;

    // ----------------------------------------------------------
    // FINANCIAL INFORMATION
    // ----------------------------------------------------------

    subtotal: string;

    couponCode: string | null;

    couponDiscount: string | null;

    total: string;

    cancelledAmount: string;

    refundedAmount: string;

    // ----------------------------------------------------------
    // CANCELLATION
    // ----------------------------------------------------------

    cancellationReason: string | null;

    deliveredAt?: string | null;

    returnedAmount?: string;

    returns?: ReturnRequest[];

    // ----------------------------------------------------------
    // ORDER TIMING
    // ----------------------------------------------------------

    expiresAt: string | null;

    createdAt: string;

    updatedAt: string;

    // ----------------------------------------------------------
    // ITEMS
    // ----------------------------------------------------------

    items: OrderItem[];
}

// ============================================================
// PAGINATION
// ============================================================

export interface OrderPagination {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
}

// ============================================================
// LIST RESPONSE
// ============================================================

export interface OrderListResponse {
    orders: OrderListItem[];

    pagination: OrderPagination;
}

export type RefundOutcome =
    | { status: "SKIPPED"; reason?: string }
    | {
          status: "PROCESSED";
          refundId: number;
          amount: string | number;
          razorpayRefundId?: string | null;
      }
    | {
          status: "PENDING";
          refundId: number;
          amount: string | number;
          razorpayRefundId?: string | null;
          reason?: string;
      }
    | {
          status: "FAILED";
          refundId: number;
          amount: string | number;
          failureReason?: string;
      };

// ============================================================
// ITEM MUTATION RESULT
// ============================================================

export interface OrderItemMutationResult {
    id: number;

    remainingQuantity: number;

    cancelledQuantity: number;

    returnedQuantity: number;

    updatedAt: string;

    refund?: RefundOutcome | null;

    returnRequest?: ReturnRequest;
}

export type CancelOrderResult = OrderDetails & {
    refund?: RefundOutcome | null;
};

// ============================================================
// GET ORDERS
// ============================================================

export async function getOrders(
    page = 1,
    limit = 10,
    options: {
        status?: OrderStatus;
        search?: string;
        dateField?: "createdAt" | "updatedAt";
        startDate?: string;
        endDate?: string;
    } = {}
): Promise<OrderListResponse> {
    const validated = listOrdersSchema.parse({
        page,
        limit,
        ...options,
    });

    const response = await apiPrivate.get(
        "/customer/orders",
        {
            params: validated,
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
    const validated = orderIdSchema.parse({
        orderId,
    });

    const response = await apiPrivate.get(
        `/customer/orders/${validated.orderId}`
    );

    return response.data.data;
}

// ============================================================
// CANCEL ENTIRE ORDER
// ============================================================

export async function cancelOrder(
    orderId: number,
    idempotencyKey: string,
    reason?: string
): Promise<CancelOrderResult> {
    const validated = cancelOrderSchema.parse({
        orderId,
        idempotencyKey,
        reason,
    });

    const response = await apiPrivate.patch(
        `/customer/orders/${validated.orderId}/cancel`,
        {
            idempotencyKey: validated.idempotencyKey,
            reason: validated.reason,
        }
    );

    return response.data.data;
}

// ============================================================
// CANCEL ORDER ITEM
// ============================================================

export async function cancelOrderItem(
    orderId: number,
    itemId: number,
    quantity: number,
    idempotencyKey: string,
    reason?: string
): Promise<OrderItemMutationResult> {
    const validated = cancelOrderItemSchema.parse({
        orderId,
        itemId,
        quantity,
        idempotencyKey,
        reason,
    });

    const response = await apiPrivate.patch(
        `/customer/orders/${validated.orderId}/items/${validated.itemId}/cancel`,
        {
            quantity: validated.quantity,
            idempotencyKey: validated.idempotencyKey,
            reason: validated.reason,
        }
    );

    return response.data.data;
}

// ============================================================
// RETURN ORDER ITEM
// ============================================================

export async function returnOrderItem(
    orderId: number,
    itemId: number,
    quantity: number,
    reason: string,
    idempotencyKey: string
): Promise<OrderItemMutationResult> {
    const validated = returnOrderItemSchema.parse({
        orderId,
        itemId,
        quantity,
        reason,
        idempotencyKey,
    });

    const response = await apiPrivate.post(
        `/customer/orders/${validated.orderId}/items/${validated.itemId}/return`,
        {
            quantity: validated.quantity,
            reason: validated.reason,
            idempotencyKey: validated.idempotencyKey,
        }
    );

    return response.data.data;
}
