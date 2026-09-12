"use client";

import Image from "next/image";

import Link from "next/link";

import { useState } from "react";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    XCircle,
    RotateCcw,
    AlertTriangle,
} from "lucide-react";

import {
    cancelOrder,
    cancelOrderItem,
    returnOrderItem,
    newIdempotencyKey,
    type OrderDetails as OrderDetailsType,
    type OrderItem,
    type OrderItemMutationResult,
} from "@/app/services/customer/order.service";

import {
    cancelOrderSchema,
    cancelOrderItemSchema,
    returnOrderItemSchema,
} from "@/app/validations/customer/order.validation";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

// ============================================================
// PROPS
// ============================================================

interface OrderDetailsProps {
    order: OrderDetailsType;
}

// ============================================================
// STYLES
// ============================================================

const STATUS_STYLES: Record<
    OrderDetailsType["status"],
    string
> = {
    PENDING:
        "bg-yellow-100 text-yellow-700",

    CONFIRMED:
        "bg-blue-100 text-blue-700",

    CANCELLED:
        "bg-red-100 text-red-700",

    DELIVERED:
        "bg-green-100 text-green-700",
};

const PAYMENT_STATUS_STYLES: Record<
    OrderDetailsType["paymentStatus"],
    string
> = {
    PENDING:
        "bg-yellow-100 text-yellow-700",

    PAID:
        "bg-green-100 text-green-700",

    FAILED:
        "bg-red-100 text-red-700",
};

// ============================================================
// FORMATTERS
// ============================================================

function formatPrice(price: string) {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
        }
    ).format(Number(price));
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );
}

function formatDateTime(date: string) {
    return new Date(date).toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

// ============================================================
// ITEM ACTIONS
// ============================================================

function ItemActions({
    orderId,
    item,
    orderStatus,
    onUpdated,
}: {
    orderId: number;
    item: OrderItem;
    orderStatus: OrderDetailsType["status"];
    onUpdated: (
        updated: OrderItemMutationResult
    ) => void;
}) {
    const [qty, setQty] = useState(1);

    const [reason, setReason] =
        useState("");

    const [activeForm, setActiveForm] =
        useState<
            "cancel" | "return" | null
        >(null);

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");

    // ========================================================
    // PERMISSION
    // ========================================================

    const canCancel =
        (
            orderStatus === "PENDING" ||
            orderStatus === "CONFIRMED"
        ) &&
        item.remainingQuantity > 0;

    const canReturn =
        orderStatus === "DELIVERED" &&
        item.remainingQuantity > 0;

    // ========================================================
    // NO AVAILABLE ACTION
    // ========================================================

    if (!canCancel && !canReturn) {
        if (item.cancelledQuantity > 0) {
            return (
                <p className="mt-2 text-xs text-red-500">
                    {item.cancelledQuantity} unit(s)
                    {" "}
                    cancelled
                </p>
            );
        }

        if (item.returnedQuantity > 0) {
            return (
                <p className="mt-2 text-xs text-amber-600">
                    {item.returnedQuantity} unit(s)
                    {" "}
                    returned
                </p>
            );
        }

        return null;
    }

    // ========================================================
    // CLOSE FORM
    // ========================================================

    function closeForm() {
        setActiveForm(null);
        setReason("");
        setError("");
        setQty(1);
    }

    // ========================================================
    // CANCEL ITEM
    // ========================================================

    async function handleCancel() {
        // Validate quantity against the same rule the schema/server
        // enforces, plus the local remainingQuantity ceiling which
        // the schema has no way to know about.
        const qtyCheck =
            cancelOrderItemSchema.shape.quantity.safeParse(
                qty
            );

        if (!qtyCheck.success) {
            setError(
                qtyCheck.error.issues[0].message
            );
            return;
        }

        if (qty > item.remainingQuantity) {
            setError(
                `Only ${item.remainingQuantity} unit(s) remaining.`
            );
            return;
        }

        const trimmedReason = reason.trim();

        // reason is optional, but if provided it must satisfy
        // min(5) — an empty string is fine, "abc" is not.
        if (trimmedReason) {
            const reasonCheck =
                cancelOrderItemSchema.shape.reason.safeParse(
                    trimmedReason
                );

            if (!reasonCheck.success) {
                setError(
                    reasonCheck.error.issues[0]
                        .message
                );
                return;
            }
        }

        try {
            setBusy(true);
            setError("");

            // ------------------------------------------------
            // Generate ONE key for this user action.
            //
            // If the same HTTP request is retried, the same
            // key should be reused.
            // ------------------------------------------------

            const idempotencyKey =
                newIdempotencyKey();

            const updated =
                await cancelOrderItem(
                    orderId,
                    item.id,
                    qty,
                    idempotencyKey,
                    trimmedReason || undefined
                );

            // ------------------------------------------------
            // Mutation response only contains mutable fields.
            //
            // Parent merges these fields into existing item.
            // ------------------------------------------------

            onUpdated(updated);

            closeForm();
        } catch (err) {
            console.error(
                "Failed to cancel item:",
                err
            );

            setError(
                getApiErrorMessage(
                    err,
                    "Unable to cancel this item."
                )
            );
        } finally {
            setBusy(false);
        }
    }

    // ========================================================
    // RETURN ITEM
    // ========================================================

    async function handleReturn() {
        const qtyCheck =
            returnOrderItemSchema.shape.quantity.safeParse(
                qty
            );

        if (!qtyCheck.success) {
            setError(
                qtyCheck.error.issues[0].message
            );
            return;
        }

        if (qty > item.remainingQuantity) {
            setError(
                `Only ${item.remainingQuantity} unit(s) remaining.`
            );
            return;
        }

        const trimmedReason = reason.trim();

        // reason is required for returns (min 5, no optional()).
        const reasonCheck =
            returnOrderItemSchema.shape.reason.safeParse(
                trimmedReason
            );

        if (!reasonCheck.success) {
            setError(
                reasonCheck.error.issues[0]
                    .message
            );
            return;
        }

        try {
            setBusy(true);
            setError("");

            const idempotencyKey =
                newIdempotencyKey();

            const updated =
                await returnOrderItem(
                    orderId,
                    item.id,
                    qty,
                    trimmedReason,
                    idempotencyKey
                );

            onUpdated(updated);

            closeForm();
        } catch (err) {
            console.error(
                "Failed to submit return:",
                err
            );

            setError(
                getApiErrorMessage(
                    err,
                    "Unable to submit the return."
                )
            );
        } finally {
            setBusy(false);
        }
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="mt-3 space-y-2 border-t pt-3">

            {error && (
                <p className="text-xs text-red-600">
                    {error}
                </p>
            )}

            {/* Quantity */}

            <div className="flex items-center gap-2">
                <label
                    htmlFor={`qty-${item.id}`}
                    className="text-xs text-gray-500"
                >
                    Qty
                </label>

                <input
                    id={`qty-${item.id}`}
                    type="number"
                    min={1}
                    max={item.remainingQuantity}
                    value={qty}
                    disabled={busy}
                    onChange={(e) => {
                        const value =
                            Number(e.target.value);

                        if (
                            !Number.isFinite(value)
                        ) {
                            setQty(1);
                            return;
                        }

                        setQty(
                            Math.min(
                                item.remainingQuantity,
                                Math.max(1, value)
                            )
                        );
                    }}
                    className="w-16 rounded-lg border px-2 py-1 text-sm"
                />

                <span className="text-xs text-gray-400">
                    of {item.remainingQuantity}
                    {" "}
                    remaining
                </span>
            </div>

            {/* Action buttons */}

            {!activeForm && (
                <div className="flex gap-2">

                    {canCancel && (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveForm(
                                    "cancel"
                                );
                                setError("");
                            }}
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                            <XCircle size={14} />

                            Cancel item
                        </button>
                    )}

                    {canReturn && (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveForm(
                                    "return"
                                );
                                setError("");
                            }}
                            className="flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                            <RotateCcw size={14} />

                            Return item
                        </button>
                    )}

                </div>
            )}

            {/* Cancel form */}

            {activeForm === "cancel" && (
                <div className="space-y-2">

                    <textarea
                        value={reason}
                        onChange={(e) =>
                            setReason(
                                e.target.value
                            )
                        }
                        placeholder="Reason for cancelling — leave blank, or 5+ characters"
                        maxLength={500}
                        className="w-full rounded-lg border p-2 text-xs"
                        rows={2}
                        disabled={busy}
                    />

                    <div className="flex gap-2">

                        <button
                            type="button"
                            disabled={busy}
                            onClick={
                                handleCancel
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                            {busy
                                ? "Cancelling..."
                                : `Cancel ${qty} unit(s)`}
                        </button>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={
                                closeForm
                            }
                            className="text-xs text-gray-500 underline disabled:opacity-50"
                        >
                            Never mind
                        </button>

                    </div>
                </div>
            )}

            {/* Return form */}

            {activeForm === "return" && (
                <div className="space-y-2">

                    <textarea
                        value={reason}
                        onChange={(e) =>
                            setReason(
                                e.target.value
                            )
                        }
                        placeholder="Reason for return (min 5 characters)"
                        maxLength={500}
                        className="w-full rounded-lg border p-2 text-xs"
                        rows={2}
                        disabled={busy}
                    />

                    <div className="flex gap-2">

                        <button
                            type="button"
                            disabled={busy}
                            onClick={
                                handleReturn
                            }
                            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                            {busy
                                ? "Submitting..."
                                : "Submit return"}
                        </button>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={
                                closeForm
                            }
                            className="text-xs text-gray-500 underline disabled:opacity-50"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

// ============================================================
// MAIN ORDER DETAILS
// ============================================================

export default function OrderDetails({
    order: initialOrder,
}: OrderDetailsProps) {
    const [order, setOrder] =
        useState<OrderDetailsType>(
            initialOrder
        );

    const [showCancelForm, setShowCancelForm] =
        useState(false);

    const [cancelReason, setCancelReason] =
        useState("");

    const [cancelling, setCancelling] =
        useState(false);

    const [error, setError] =
        useState("");

    // ========================================================
    // ORDER-LEVEL CANCEL
    // ========================================================

    async function handleCancelOrder() {
        const trimmedReason =
            cancelReason.trim();

        // reason is optional, but min(5) applies if non-empty.
        if (trimmedReason) {
            const reasonCheck =
                cancelOrderSchema.shape.reason.safeParse(
                    trimmedReason
                );

            if (!reasonCheck.success) {
                setError(
                    reasonCheck.error.issues[0]
                        .message
                );
                return;
            }
        }

        try {
            setCancelling(true);
            setError("");

            // Generate once for this cancellation action.
            const idempotencyKey =
                newIdempotencyKey();

            const updatedOrder =
                await cancelOrder(
                    order.id,
                    idempotencyKey,
                    trimmedReason || undefined
                );

            setOrder(updatedOrder);

            setShowCancelForm(false);

            setCancelReason("");
        } catch (err) {
            console.error(
                "Failed to cancel order:",
                err
            );

            setError(
                getApiErrorMessage(
                    err,
                    "Unable to cancel the order. Please try again."
                )
            );
        } finally {
            setCancelling(false);
        }
    }

    // ========================================================
    // ITEM UPDATED
    // ========================================================

    function handleItemUpdated(
        updated: OrderItemMutationResult
    ) {
        setOrder((prev) => ({
            ...prev,

            items: prev.items.map(
                (item) =>
                    item.id === updated.id
                        ? {
                              ...item,
                              ...updated,
                          }
                        : item
            ),
        }));
    }

    // ========================================================
    // STATUS HELPERS
    // ========================================================

    const canCancelWholeOrder =
        order.status === "PENDING" ||
        order.status === "CONFIRMED";

    const showExpiryWarning =
        order.status === "PENDING" &&
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus === "PENDING" &&
        Boolean(order.expiresAt);

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            {/* Back */}

            <Link
                href="/accounts/orders"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
                <ArrowLeft size={17} />

                Back to orders
            </Link>

            {/* Order header */}

            <div className="rounded-xl border bg-white p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <p className="text-sm text-gray-500">
                            Order #{order.id}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays size={16} />

                            Placed on{" "}
                            {formatDate(
                                order.createdAt
                            )}
                        </div>

                    </div>

                    <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${STATUS_STYLES[order.status]}`}
                    >
                        {order.status}
                    </span>

                </div>

                {/* Cancellation reason */}

                {order.status ===
                    "CANCELLED" &&
                    order.cancellationReason && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">

                            <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <p>
                                Cancellation reason:{" "}
                                {
                                    order.cancellationReason
                                }
                            </p>

                        </div>
                    )}

                {/* Expiry */}

                {showExpiryWarning &&
                    order.expiresAt && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">

                            <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <p>
                                Complete payment before{" "}
                                {formatDateTime(
                                    order.expiresAt
                                )}{" "}
                                or this order will be automatically cancelled.
                            </p>

                        </div>
                    )}

            </div>

            {/* Global error */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                {/* ====================================================
                    LEFT
                ==================================================== */}

                <div className="space-y-6">

                    {/* Items */}

                    <section className="rounded-xl border bg-white">

                        <div className="border-b p-5">

                            <h2 className="flex items-center gap-2 font-semibold">
                                <Package size={19} />

                                Order items
                            </h2>

                        </div>

                        <div className="divide-y">

                            {order.items.map(
                                (item) => {
                                    const image =
                                        item
                                            .productVariant
                                            ?.productColor
                                            ?.images?.[0];

                                    return (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="p-5"
                                        >

                                            <div className="flex gap-4">

                                                {/* Image */}

                                                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                                                    {image ? (
                                                        <Image
                                                            src={
                                                                image.url
                                                            }
                                                            alt={
                                                                image.altText ||
                                                                item.productName
                                                            }
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Package
                                                                size={
                                                                    24
                                                                }
                                                                className="text-gray-400"
                                                            />
                                                        </div>
                                                    )}

                                                </div>

                                                {/* Product */}

                                                <div className="min-w-0 flex-1">

                                                    <h3 className="font-medium">
                                                        {
                                                            item.productName
                                                        }
                                                    </h3>

                                                    <div className="mt-2 space-y-1 text-sm text-gray-500">

                                                        <p>
                                                            Color:{" "}
                                                            <span className="text-gray-800">
                                                                {
                                                                    item.colorName
                                                                }
                                                            </span>
                                                        </p>

                                                        <p>
                                                            Size:{" "}
                                                            <span className="text-gray-800">
                                                                {
                                                                    item.sizeName
                                                                }
                                                            </span>
                                                        </p>

                                                        <p>
                                                            Ordered:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </p>

                                                        <p>
                                                            Remaining:{" "}
                                                            {
                                                                item.remainingQuantity
                                                            }
                                                        </p>

                                                        {item.cancelledQuantity >
                                                            0 && (
                                                            <p className="text-red-600">
                                                                Cancelled:{" "}
                                                                {
                                                                    item.cancelledQuantity
                                                                }
                                                            </p>
                                                        )}

                                                        {item.returnedQuantity >
                                                            0 && (
                                                            <p className="text-amber-600">
                                                                Returned:{" "}
                                                                {
                                                                    item.returnedQuantity
                                                                }
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                                {/* Price */}

                                                <div className="text-right">

                                                    <p className="font-semibold">
                                                        {formatPrice(
                                                            item.price
                                                        )}
                                                    </p>

                                                    {item.quantity >
                                                        1 && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                formatPrice(
                                                                    item.price
                                                                )
                                                            }{" "}
                                                            ×{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                            {/* Item actions */}

                                            <ItemActions
                                                orderId={
                                                    order.id
                                                }
                                                item={
                                                    item
                                                }
                                                orderStatus={
                                                    order.status
                                                }
                                                onUpdated={
                                                    handleItemUpdated
                                                }
                                            />

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </section>

                    {/* Shipping */}

                    <section className="rounded-xl border bg-white p-5">

                        <h2 className="flex items-center gap-2 font-semibold">
                            <MapPin size={19} />

                            Shipping address
                        </h2>

                        <div className="mt-4 text-sm leading-6 text-gray-600">

                            <p className="font-medium text-gray-900">
                                {
                                    order.shippingFirstName
                                }{" "}
                                {
                                    order.shippingLastName
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
                                ,{" "}
                                {
                                    order.shippingCountry
                                }
                            </p>

                        </div>

                    </section>

                </div>

                {/* ====================================================
                    RIGHT
                ==================================================== */}

                <div className="space-y-6">

                    {/* Payment */}

                    <section className="rounded-xl border bg-white p-5">

                        <h2 className="flex items-center gap-2 font-semibold">
                            <CreditCard size={19} />

                            Payment
                        </h2>

                        <div className="mt-4 space-y-4 text-sm">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Method
                                </span>

                                <span className="font-medium">
                                    {
                                        order.paymentMethod
                                    }
                                </span>
                            </div>

                            <div className="flex items-center justify-between">

                                <span className="text-gray-500">
                                    Status
                                </span>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
                                >
                                    {
                                        order.paymentStatus
                                    }
                                </span>

                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Contact email
                                </span>

                                <span className="break-all text-right font-medium">
                                    {
                                        order.contactEmail
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Contact phone
                                </span>

                                <span className="font-medium">
                                    {
                                        order.contactPhone
                                    }
                                </span>
                            </div>

                        </div>

                    </section>

                    {/* Summary */}

                    <section className="rounded-xl border bg-white p-5">

                        <h2 className="font-semibold">
                            Order summary
                        </h2>

                        <div className="mt-4 space-y-3 text-sm">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span>
                                    {formatPrice(
                                        order.subtotal
                                    )}
                                </span>
                            </div>

                            {Number(
                                order.cancelledAmount
                            ) > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>
                                        Cancelled amount
                                    </span>

                                    <span>
                                        -
                                        {formatPrice(
                                            order.cancelledAmount
                                        )}
                                    </span>
                                </div>
                            )}

                            {Number(
                                order.refundedAmount
                            ) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>
                                        Refunded
                                    </span>

                                    <span>
                                        {formatPrice(
                                            order.refundedAmount
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className="border-t pt-3">

                                <div className="flex justify-between">

                                    <span className="font-semibold">
                                        Total
                                    </span>

                                    <span className="text-lg font-bold">
                                        {formatPrice(
                                            order.total
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* Whole order cancellation */}

                    {canCancelWholeOrder && (
                        <section className="rounded-xl border bg-white p-5">

                            {!showCancelForm ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCancelForm(
                                                true
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        <XCircle
                                            size={18}
                                        />

                                        Cancel entire order
                                    </button>

                                    <p className="mt-2 text-xs text-gray-400">
                                        Or cancel individual
                                        items below instead
                                        of the whole order.
                                    </p>
                                </>
                            ) : (
                                <div className="space-y-3">

                                    <p className="text-sm font-medium text-gray-900">
                                        Cancel this order?
                                    </p>

                                    <textarea
                                        value={
                                            cancelReason
                                        }
                                        onChange={(e) =>
                                            setCancelReason(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Reason for cancelling — leave blank, or 5+ characters"
                                        maxLength={500}
                                        className="w-full rounded-lg border p-2 text-xs"
                                        rows={3}
                                        disabled={
                                            cancelling
                                        }
                                    />

                                    <div className="flex gap-2">

                                        <button
                                            type="button"
                                            disabled={
                                                cancelling
                                            }
                                            onClick={
                                                handleCancelOrder
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <XCircle
                                                size={16}
                                            />

                                            {cancelling
                                                ? "Cancelling..."
                                                : "Confirm cancellation"}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                cancelling
                                            }
                                            onClick={() => {
                                                setShowCancelForm(
                                                    false
                                                );

                                                setCancelReason(
                                                    ""
                                                );

                                                setError(
                                                    ""
                                                );
                                            }}
                                            className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Never mind
                                        </button>

                                    </div>

                                </div>
                            )}

                        </section>
                    )}

                    {/* Delivered */}

                    {order.status ===
                        "DELIVERED" && (
                        <section className="rounded-xl border border-green-200 bg-green-50 p-5">

                            <div className="flex gap-3">

                                <CheckCircle2
                                    size={20}
                                    className="shrink-0 text-green-600"
                                />

                                <div>

                                    <p className="font-medium text-green-800">
                                        Order delivered
                                    </p>

                                    <p className="mt-1 text-sm text-green-700">
                                        This order was
                                        successfully
                                        delivered. You can
                                        return individual
                                        items above.
                                    </p>

                                </div>

                            </div>

                        </section>
                    )}

                </div>

            </div>

        </div>
    );
}
