
import apiPrivate from "@/app/lib/api/apiPrivate";

// ============================================================
// TYPES
// ============================================================

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "DELIVERED";

export type PaymentStatus =
    | "PENDING"
    | "PAID"
    | "FAILED";

export type PaymentMethod =
    | "COD"
    | "ONLINE";

export interface OrderCustomer {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
}

export interface OrderListItem {
    id: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;

    contactEmail: string;
    contactPhone: string;

    total: string;

    expiresAt: string | null;
    createdAt: string;

    user: OrderCustomer;

    nextStatuses: OrderStatus[];
}

export interface OrderItemAction {
    id: number;
    orderItemId: number;
    type: "CANCEL" | "RETURN";
    quantity: number;
    reason: string | null;
    createdAt: string;
}

export interface OrderItemDetail {
    id: number;
    orderId: number;
    productVariantId: number;

    productName: string;
    colorName: string;
    sizeName: string;

    price: string;

    // Immutable original quantity
    quantity: number;

    // Mutable quantity tracking
    remainingQuantity: number;
    cancelledQuantity: number;
    returnedQuantity: number;

    createdAt: string;
    updatedAt: string;

    actions: OrderItemAction[];

    productVariant: {
        id: number;

        size: {
            name: string;
        };

        productColor: {
            color: {
                name: string;
                hexCode: string | null;
            };

            product: {
                id: number;
                name: string;
                slug: string;
            };

            images: {
                url: string;
                altText: string | null;
            }[];
        };
    };
}

export interface OrderDetails {
    id: number;

    status: OrderStatus;

    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;

    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;

    contactEmail: string;
    contactPhone: string;

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

    // Added for cancellation/refund accounting
    cancelledAmount: string;
    refundedAmount: string;

    idempotencyKey: string;

    cancellationReason: string | null;

    expiresAt: string | null;

    createdAt: string;
    updatedAt: string;

    user: OrderCustomer & {
        role: string;
        status: string;
    };

    items: OrderItemDetail[];

    nextStatuses: OrderStatus[];
}

export interface OrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface OrderListResponse {
    success: boolean;
    orders: OrderListItem[];
    pagination: OrderPagination;
}

export interface GetOrderResponse {
    success: boolean;
    data: OrderDetails;
}

export interface UpdateOrderStatusResponse {
    success: boolean;
    data: OrderDetails;
}

export interface ListOrdersParams {
    search?: string;

    status?: OrderStatus;

    paymentStatus?: PaymentStatus;

    paymentMethod?: PaymentMethod;

    page?: number;

    limit?: number;

    sortBy?: "createdAt" | "total" | "status";

    sortOrder?: "asc" | "desc";
}

// ============================================================
// API
// ============================================================

export const getOrders = async (
    params?: ListOrdersParams
): Promise<OrderListResponse> => {
    const response = await apiPrivate.get<OrderListResponse>(
        "/admin/orders",
        {
            params,
        }
    );

    return response.data;
};

export const getOrderById = async (
    id: number
): Promise<GetOrderResponse> => {
    const response = await apiPrivate.get<GetOrderResponse>(
        `/admin/orders/${id}`
    );

    return response.data;
};

export const updateOrderStatus = async (
    id: number,
    status: OrderStatus,
    reason?: string,
    idempotencyKey?: string
): Promise<UpdateOrderStatusResponse> => {
    const response = await apiPrivate.patch<UpdateOrderStatusResponse>(
        `/admin/orders/${id}/status`,
        {
            status,
            reason,
            idempotencyKey,
        }
    );

    return response.data;
};
