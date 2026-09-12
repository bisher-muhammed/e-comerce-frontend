
"use client";

import Image from "next/image";

import Link from "next/link";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    Package,
    User,
} from "lucide-react";

import {
    getOrderById,
    type OrderDetails,
    type OrderStatus,
} from "@/app/services/admin/order.service";

import { orderIdSchema } from "@/app/validations/admin/order.validation";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderStatusSelect from "../components/OrderStatusSelect";

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(date: string) {
    return new Date(date).toLocaleString();
}

function formatPrice(value: string) {
    return Number(value).toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
        }
    );
}

const PAYMENT_STATUS_STYLES = {
    PENDING:
        "bg-yellow-500/10 text-yellow-700",
    PAID:
        "bg-green-500/10 text-green-700",
    FAILED:
        "bg-red-500/10 text-red-700",
} as const;

// ============================================================
// PAGE
// ============================================================

interface OrderDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function OrderDetailsPage({
    params,
}: OrderDetailsPageProps) {
    const [order, setOrder] =
        useState<OrderDetails | null>(null);

    const [orderId, setOrderId] =
        useState<number | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    // ========================================================
    // LOAD ORDER
    // ========================================================

    const loadOrder = useCallback(
        async (id: number) => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getOrderById(id);

                setOrder(response.data);
            } catch (err) {
                console.error(err);

                setError(
                    getApiErrorMessage(
                        err,
                        "Failed to load order details."
                    )
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ========================================================
    // RESOLVE PARAM
    // ========================================================

    useEffect(() => {
        let active = true;

        async function resolveParams() {
            try {
                const { id } = await params;

                const parsed =
                    orderIdSchema.safeParse(
                        Number(id)
                    );

                if (!parsed.success) {
                    if (active) {
                        setError(
                            "Invalid order ID."
                        );
                        setLoading(false);
                    }

                    return;
                }

                if (!active) {
                    return;
                }

                setOrderId(parsed.data);

                await loadOrder(parsed.data);
            } catch (err) {
                if (!active) {
                    return;
                }

                console.error(err);

                setError(
                    getApiErrorMessage(
                        err,
                        "Failed to load order."
                    )
                );

                setLoading(false);
            }
        }

        resolveParams();

        return () => {
            active = false;
        };
    }, [params, loadOrder]);

    // ========================================================
    // STATUS UPDATED
    // ========================================================

    const handleStatusUpdated = useCallback(
        async (_status: OrderStatus) => {
            /*
             * Order status changes can also change:
             *
             * - subtotal
             * - total
             * - cancelledAmount
             * - paymentStatus
             * - cancellationReason
             * - item quantities
             * - nextStatuses
             *
             * Therefore we reload the complete order.
             */
            if (orderId !== null) {
                await loadOrder(orderId);
            }
        },
        [orderId, loadOrder]
    );

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (error || !order) {
        return (
            <main className="p-6">
                <Link
                    href="/admin/orders"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to orders
                </Link>

                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error ??
                        "Order not found."}
                </div>
            </main>
        );
    }

    const showExpiryWarning =
        order.status === "PENDING" &&
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus === "PENDING" &&
        Boolean(order.expiresAt);

    return (
        <main className="mx-auto max-w-6xl space-y-6 p-6">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link
                        href="/admin/orders"
                        className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to orders
                    </Link>

                    <h1 className="text-2xl font-semibold">
                        Order #{order.id}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Placed{" "}
                        {formatDateTime(
                            order.createdAt
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <OrderStatusBadge
                        status={order.status}
                    />

                    <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={
                            order.status
                        }
                        nextStatuses={
                            order.nextStatuses
                        }
                        onUpdated={
                            handleStatusUpdated
                        }
                    />
                </div>
            </div>

            {/* ==================================================
                ORDER STATUS / WARNING
            ================================================== */}

            <section className="rounded-lg border border-border bg-card p-6">
                {order.status ===
                "CANCELLED" ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                            <AlertTriangle className="h-4 w-4" />

                            This order was
                            cancelled.
                        </div>

                        {order.cancellationReason && (
                            <div className="rounded-lg bg-destructive/10 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-destructive">
                                    Cancellation
                                    reason
                                </p>

                                <p className="mt-1 text-sm text-destructive">
                                    {
                                        order.cancellationReason
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Current status
                            </p>

                            <div className="mt-2">
                                <OrderStatusBadge
                                    status={
                                        order.status
                                    }
                                />
                            </div>
                        </div>

                        {showExpiryWarning &&
                            order.expiresAt && (
                                <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-700">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                                    <p>
                                        Unpaid —
                                        payment
                                        window
                                        closes{" "}
                                        {formatDateTime(
                                            order.expiresAt
                                        )}
                                        .
                                    </p>
                                </div>
                            )}
                    </div>
                )}
            </section>

            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="space-y-6 lg:col-span-2">
                    {/* ==================================================
                        ORDER ITEMS
                    ================================================== */}

                    <section className="rounded-lg border border-border bg-card">
                        <div className="border-b border-border p-5">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5" />

                                <h2 className="font-semibold">
                                    Order items
                                </h2>
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {order.items.map(
                                (item) => {
                                    const image =
                                        item
                                            .productVariant
                                            .productColor
                                            .images[0];

                                    const activeAmount =
                                        Number(
                                            item.price
                                        ) *
                                        item.remainingQuantity;

                                    return (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="flex flex-col gap-4 p-5 sm:flex-row"
                                        >
                                            {/* Image */}
                                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                {image ? (
                                                    <Image
                                                        src={
                                                            image.url
                                                        }
                                                        alt={
                                                            image.altText ??
                                                            item.productName
                                                        }
                                                        fill
                                                        sizes="96px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                                        No
                                                        image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Main info */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium">
                                                    {
                                                        item.productName
                                                    }
                                                </h3>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        item.colorName
                                                    }

                                                    {" · "}

                                                    Size{" "}
                                                    {
                                                        item.sizeName
                                                    }
                                                </p>

                                                <p className="mt-2 text-sm">
                                                    {formatPrice(
                                                        item.price
                                                    )}{" "}
                                                    ×{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </p>

                                                {/* Quantity lifecycle */}
                                                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                    <QuantityBox
                                                        label="Ordered"
                                                        value={
                                                            item.quantity
                                                        }
                                                    />

                                                    <QuantityBox
                                                        label="Remaining"
                                                        value={
                                                            item.remainingQuantity
                                                        }
                                                    />

                                                    <QuantityBox
                                                        label="Cancelled"
                                                        value={
                                                            item.cancelledQuantity
                                                        }
                                                    />

                                                    <QuantityBox
                                                        label="Returned"
                                                        value={
                                                            item.returnedQuantity
                                                        }
                                                    />
                                                </div>

                                                {/* Action history */}
                                                {item
                                                    .actions
                                                    .length >
                                                    0 && (
                                                    <div className="mt-4">
                                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            Action
                                                            history
                                                        </p>

                                                        <div className="space-y-2">
                                                            {item.actions.map(
                                                                (
                                                                    action
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            action.id
                                                                        }
                                                                        className="rounded-lg border border-border bg-muted/30 p-3 text-xs"
                                                                    >
                                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                                            <span className="font-medium">
                                                                                {
                                                                                    action.type
                                                                                }{" "}
                                                                                ·{" "}
                                                                                {
                                                                                    action.quantity
                                                                                }{" "}
                                                                                unit(s)
                                                                            </span>

                                                                            <span className="text-muted-foreground">
                                                                                {formatDateTime(
                                                                                    action.createdAt
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        {action.reason && (
                                                                            <p className="mt-1 text-muted-foreground">
                                                                                {
                                                                                    action.reason
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item amount */}
                                            <div className="text-left sm:min-w-28 sm:text-right">
                                                <p className="font-medium">
                                                    {formatPrice(
                                                        activeAmount.toFixed(
                                                            2
                                                        )
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {
                                                        item.remainingQuantity
                                                    }{" "}
                                                    active
                                                    unit(s)
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </section>

                    {/* ==================================================
                        CUSTOMER + SHIPPING
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Customer */}
                        <section className="rounded-lg border border-border bg-card p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />

                                <h2 className="font-semibold">
                                    Customer
                                </h2>
                            </div>

                            <div className="space-y-3 text-sm">
                                <InfoRow
                                    label="Name"
                                    value={`${order.user.firstName} ${
                                        order.user
                                            .lastName ??
                                        ""
                                    }`}
                                />

                                <InfoRow
                                    label="Email"
                                    value={
                                        order.user
                                            .email
                                    }
                                />

                                <InfoRow
                                    label="Order email"
                                    value={
                                        order.contactEmail
                                    }
                                />

                                <InfoRow
                                    label="Phone"
                                    value={
                                        order.contactPhone
                                    }
                                />

                                <InfoRow
                                    label="Role"
                                    value={
                                        order.user
                                            .role
                                    }
                                />

                                <InfoRow
                                    label="Account status"
                                    value={
                                        order.user
                                            .status
                                    }
                                />
                            </div>
                        </section>

                        {/* Shipping */}
                        <section className="rounded-lg border border-border bg-card p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />

                                <h2 className="font-semibold">
                                    Shipping address
                                </h2>
                            </div>

                            <div className="text-sm leading-6">
                                <p className="font-medium">
                                    {
                                        order.shippingFirstName
                                    }{" "}
                                    {
                                        order.shippingLastName ??
                                        ""
                                    }
                                </p>

                                <p>
                                    {
                                        order.shippingPhone
                                    }
                                </p>

                                <p className="mt-2">
                                    {
                                        order.shippingLine1
                                    }
                                </p>

                                {order.shippingLine2 && (
                                    <p>
                                        {
                                            order.shippingLine2
                                        }
                                    </p>
                                )}

                                <p>
                                    {
                                        order.shippingCity
                                    }
                                    ,{" "}
                                    {
                                        order.shippingState
                                    }
                                </p>

                                <p>
                                    {
                                        order.shippingPostalCode
                                    }
                                </p>

                                <p>
                                    {
                                        order.shippingCountry
                                    }
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* ==================================================
                    RIGHT SIDEBAR
                ================================================== */}

                <div className="space-y-6">
                    {/* Financial summary */}
                    <section className="rounded-lg border border-border bg-card p-5">
                        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Order summary
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Current subtotal
                                </span>

                                <span>
                                    {formatPrice(
                                        order.subtotal
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Cancelled amount
                                </span>

                                <span className="text-destructive">
                                    {formatPrice(
                                        order.cancelledAmount
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Refunded amount
                                </span>

                                <span className="text-green-600">
                                    {formatPrice(
                                        order.refundedAmount
                                    )}
                                </span>
                            </div>

                            <div className="border-t border-border pt-3">
                                <div className="flex justify-between gap-4 font-semibold">
                                    <span>
                                        Current total
                                    </span>

                                    <span>
                                        {formatPrice(
                                            order.total
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment */}
                    <section className="rounded-lg border border-border bg-card p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            Payment
                        </h2>

                        <div className="space-y-3">
                            <InfoRow
                                label="Method"
                                value={
                                    order.paymentMethod
                                }
                            />

                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        PAYMENT_STATUS_STYLES[
                                            order
                                                .paymentStatus
                                        ]
                                    }`}
                                >
                                    {
                                        order.paymentStatus
                                    }
                                </span>
                            </div>

                            {order.razorpayOrderId && (
                                <InfoRow
                                    label="Razorpay order ID"
                                    value={
                                        order.razorpayOrderId
                                    }
                                />
                            )}

                            {order.razorpayPaymentId && (
                                <InfoRow
                                    label="Razorpay payment ID"
                                    value={
                                        order.razorpayPaymentId
                                    }
                                />
                            )}
                        </div>
                    </section>

                    {/* Cancellation */}
                    {order.cancellationReason && (
                        <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-5">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                                <div>
                                    <h2 className="text-sm font-medium text-destructive">
                                        Cancellation
                                        reason
                                    </h2>

                                    <p className="mt-1 text-sm text-destructive/90">
                                        {
                                            order.cancellationReason
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Delivered */}
                    {order.status ===
                        "DELIVERED" && (
                        <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-5">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

                            <div>
                                <p className="font-medium text-green-700">
                                    Order delivered
                                </p>

                                <p className="mt-1 text-sm text-green-700/80">
                                    This order has
                                    reached the
                                    delivered state.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

// ============================================================
// SMALL COMPONENTS
// ============================================================

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
                {label}
            </span>

            <span className="max-w-[65%] break-words text-right font-medium">
                {value}
            </span>
        </div>
    );
}

function QuantityBox({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 font-semibold">
                {value}
            </p>
        </div>
    );
}
