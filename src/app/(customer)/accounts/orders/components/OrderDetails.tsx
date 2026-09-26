"use client";

import Image from "next/image";

import Link from "next/link";

import { useCallback, useEffect, useState } from "react";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    Truck,
    XCircle,
    RotateCcw,
    AlertTriangle,
} from "lucide-react";

import {
    cancelOrder,
    cancelOrderItem,
    getOrderById,
    returnOrderItem,
    type OrderDetails as OrderDetailsType,
    type OrderItem,
    type RefundOutcome,
    type ReturnRequest,
    type ReturnStatus,
} from "@/app/services/customer/order.service";

import {
    payPendingOrder,
    verifyPayment,
} from "@/app/services/customer/checkout.service";

import {
    cancelOrderSchema,
    cancelOrderItemSchema,
    returnOrderItemSchema,
} from "@/app/validations/customer/order.validation";

import {
    getApiErrorMessage,
    getApiErrorStatus,
} from "@/app/lib/api/apiError";
import { useIdempotencyKey } from "@/app/lib/ids/idempotencyKey";
import { openRazorpayCheckout } from "@/app/lib/payments/razorpayCheckout";

import {
    ORDER_STATUS_LABELS,
    ORDER_STATUS_STYLES,
    PAYMENT_STATUS_STYLES,
} from "./orderStatus";

// ============================================================
// PROPS
// ============================================================

interface OrderDetailsProps {
    order: OrderDetailsType;
}

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

const RETURN_WINDOW_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
    REQUESTED: "Return requested",
    APPROVED: "Return approved — please send the item back",
    REJECTED: "Return declined",
    RECEIVED: "Item received — refund in progress",
    REFUNDED: "Refunded",
};

const RETURN_STATUS_STYLES: Record<ReturnStatus, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    REJECTED: "bg-red-100 text-red-700",
    RECEIVED: "bg-indigo-100 text-indigo-700",
    REFUNDED: "bg-green-100 text-green-700",
};

export function describeReturn(request: ReturnRequest): string {
    if (request.status === "REFUNDED" && request.refundAmount) {
        return `Refunded ${formatPrice(request.refundAmount)}`;
    }

    return RETURN_STATUS_LABELS[request.status];
}

export function describeRefund(
    refund: RefundOutcome | null | undefined
): string | null {
    if (!refund) return null;

    switch (refund.status) {
        case "PROCESSED":
            return `Refund of ${formatPrice(String(refund.amount))} initiated. It usually reaches your account in 5–7 business days.`;

        case "PENDING":
            return `Refund of ${formatPrice(String(refund.amount))} is being processed.`;

        case "FAILED":
            return "We couldn't refund automatically — our team will process your refund.";

        default:
            return null;
    }
}

// ============================================================
// ITEM ACTIONS
// ============================================================

function ItemActions({
    orderId,
    item,
    orderStatus,
    itemCancelAllowed,
    returnWindowOpen,
    returnRequestCount,
    onChanged,
}: {
    orderId: number;
    item: OrderItem;
    orderStatus: OrderDetailsType["status"];
    itemCancelAllowed: boolean;
    returnWindowOpen: boolean;
    returnRequestCount: (itemId: number) => number;
    onChanged: (
        notice?: string | null
    ) => Promise<OrderDetailsType | null>;
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

    const cancelKey = useIdempotencyKey();
    const returnKey = useIdempotencyKey();

    const actionSignature = (reasonText: string) =>
        JSON.stringify([
            item.id,
            item.remainingQuantity,
            qty,
            reasonText,
        ]);

    // ========================================================
    // PERMISSION
    // ========================================================

    const canCancel =
        itemCancelAllowed &&
        (
            orderStatus === "PENDING" ||
            orderStatus === "CONFIRMED"
        ) &&
        item.remainingQuantity > 0;

    const canReturn =
        orderStatus === "DELIVERED" &&
        returnWindowOpen &&
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

            const updated =
                await cancelOrderItem(
                    orderId,
                    item.id,
                    qty,
                    cancelKey.take(
                        actionSignature(trimmedReason)
                    ),
                    trimmedReason || undefined
                );

            cancelKey.reset();

            closeForm();

            await onChanged(describeRefund(updated.refund));
        } catch (err) {
            const fresh = await onChanged();

            const freshItem = fresh?.items.find(
                (candidate) => candidate.id === item.id
            );

            if (
                freshItem &&
                freshItem.cancelledQuantity >=
                    item.cancelledQuantity + qty
            ) {
                cancelKey.reset();
                closeForm();
                await onChanged("Your cancellation went through.");
                return;
            }

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

            await returnOrderItem(
                orderId,
                item.id,
                qty,
                trimmedReason,
                returnKey.take(
                    actionSignature(trimmedReason)
                )
            );

            returnKey.reset();

            closeForm();

            await onChanged(
                "Return requested. We'll review it and let you know the next step here."
            );
        } catch (err) {
            const requestsBefore =
                returnRequestCount(item.id);

            const fresh = await onChanged();

            if (
                fresh &&
                (fresh.returns ?? []).filter(
                    (request) => request.orderItemId === item.id
                ).length > requestsBefore
            ) {
                returnKey.reset();
                closeForm();
                await onChanged(
                    "Your return request went through."
                );
                return;
            }

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

    const [notice, setNotice] =
        useState("");

    const [paying, setPaying] =
        useState(false);

    const [canResumePayment, setCanResumePayment] =
        useState(true);

    const cancelOrderKey = useIdempotencyKey();

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(
            () => setNow(Date.now()),
            30_000
        );

        return () => window.clearInterval(timer);
    }, []);

    const reloadOrder = useCallback(
        async (
            message?: string | null
        ): Promise<OrderDetailsType | null> => {
            let fresh: OrderDetailsType | null = null;

            try {
                fresh = await getOrderById(order.id);

                setOrder(fresh);
            } catch {}

            if (message) {
                setNotice(message);
            }

            return fresh;
        },
        [order.id]
    );

    const returnRequestCount = useCallback(
        (itemId: number) =>
            (order.returns ?? []).filter(
                (request) => request.orderItemId === itemId
            ).length,
        [order.returns]
    );

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
            setNotice("");

            const { refund, ...updatedOrder } =
                await cancelOrder(
                    order.id,
                    cancelOrderKey.take(
                        JSON.stringify([order.id, trimmedReason])
                    ),
                    trimmedReason || undefined
                );

            cancelOrderKey.reset();

            setOrder(updatedOrder);

            setShowCancelForm(false);

            setCancelReason("");

            setNotice(
                describeRefund(refund) ??
                    "Your order has been cancelled."
            );
        } catch (err) {
            const fresh = await reloadOrder();

            if (fresh?.status === "CANCELLED") {
                cancelOrderKey.reset();
                setShowCancelForm(false);
                setCancelReason("");
                setNotice("Your order has been cancelled.");
                return;
            }

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
    // ========================================================

    async function handleCompletePayment() {
        try {
            setPaying(true);
            setError("");
            setNotice("");

            const { data } = await payPendingOrder(order.id);

            if (!data.razorpay) {
                throw new Error("Missing payment details");
            }

            const outcome = await openRazorpayCheckout(
                data.razorpay,
                {
                    description: `Order #${order.id}`,
                    prefill: {
                        email: order.contactEmail,
                        contact: order.contactPhone,
                    },
                }
            );

            if (outcome.status === "dismissed") {
                return;
            }

            await verifyPayment(outcome.payment);

            await reloadOrder("Payment received. Your order is confirmed.");
        } catch (err) {
            if (getApiErrorStatus(err) === 404) {
                setCanResumePayment(false);
            }

            setError(
                getApiErrorMessage(
                    err,
                    "We couldn't open the payment. Please try again."
                )
            );

            await reloadOrder();
        } finally {
            setPaying(false);
        }
    }

    // ========================================================
    // STATUS HELPERS
    // ========================================================

    const canCancelWholeOrder =
        order.status === "PENDING" ||
        order.status === "CONFIRMED";

    const itemCancelAllowed = !(
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus !== "PAID"
    );

    const showExpiryWarning =
        order.status === "PENDING" &&
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus === "PENDING" &&
        Boolean(order.expiresAt);

    const returnWindowOpen =
        order.status === "DELIVERED" &&
        (!order.deliveredAt ||
            new Date(order.deliveredAt).getTime() +
                RETURN_WINDOW_DAYS * DAY_MS >
                now);

    const itemNames = new Map(
        order.items.map((item) => [item.id, item.productName])
    );

    const paymentWindowOpen =
        showExpiryWarning &&
        order.expiresAt !== null &&
        new Date(order.expiresAt).getTime() > now;

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
                        className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${ORDER_STATUS_STYLES[order.status]}`}
                    >
                        {ORDER_STATUS_LABELS[order.status]}
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

                            <div className="flex-1">
                                <p>
                                    {paymentWindowOpen
                                        ? "Complete payment before "
                                        : "The payment window closed at "}
                                    {formatDateTime(
                                        order.expiresAt
                                    )}
                                    {paymentWindowOpen
                                        ? " or this order will be automatically cancelled."
                                        : ". This order will be cancelled automatically."}
                                </p>

                                {paymentWindowOpen &&
                                    canResumePayment && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleCompletePayment
                                            }
                                            disabled={paying}
                                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-yellow-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-900 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <CreditCard size={16} />

                                            {paying
                                                ? "Opening payment..."
                                                : `Complete payment · ${formatPrice(order.total)}`}
                                        </button>
                                    )}
                            </div>

                        </div>
                    )}

                {order.status === "SHIPPED" && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">

                        <Truck
                            size={16}
                            className="mt-0.5 shrink-0"
                        />

                        <p>
                            Your order is on its way. It can no longer
                            be cancelled; once it is delivered you can
                            request a return.
                        </p>

                    </div>
                )}

            </div>

            {notice && (
                <div
                    role="status"
                    className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                >
                    {notice}
                </div>
            )}

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
                                                itemCancelAllowed={
                                                    itemCancelAllowed
                                                }
                                                returnWindowOpen={
                                                    returnWindowOpen
                                                }
                                                returnRequestCount={
                                                    returnRequestCount
                                                }
                                                onChanged={
                                                    reloadOrder
                                                }
                                            />

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </section>

                    {order.returns && order.returns.length > 0 && (
                        <section className="rounded-xl border bg-white">

                            <div className="border-b p-5">
                                <h2 className="flex items-center gap-2 font-semibold">
                                    <RotateCcw size={19} />

                                    Returns
                                </h2>
                            </div>

                            <ul className="divide-y">
                                {order.returns.map((request) => (
                                    <li
                                        key={request.id}
                                        className="flex flex-col gap-2 p-5 text-sm sm:flex-row sm:items-start sm:justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {itemNames.get(
                                                    request.orderItemId
                                                ) ?? "Item"}{" "}
                                                × {request.quantity}
                                            </p>

                                            <p className="mt-1 text-gray-500">
                                                Requested on{" "}
                                                {formatDate(
                                                    request.createdAt
                                                )}
                                            </p>

                                            {request.status ===
                                                "REJECTED" &&
                                                request.adminNote && (
                                                    <p className="mt-1 text-red-600">
                                                        {
                                                            request.adminNote
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${RETURN_STATUS_STYLES[request.status]}`}
                                        >
                                            {describeReturn(request)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                        </section>
                    )}

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

                            <p>
                                {
                                    order.shippingLine2
                                }
                            </p>

                            {order.shippingLandmark && (
                                <p>
                                    {
                                        order.shippingLandmark
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
                                        {itemCancelAllowed
                                            ? "Or cancel individual items below instead of the whole order."
                                            : "Individual items can be cancelled once the payment is complete."}
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
                                        {returnWindowOpen
                                            ? `This order was delivered. You can request a return for individual items above within ${RETURN_WINDOW_DAYS} days of delivery.`
                                            : "This order was delivered. Its return window has closed."}
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
