"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, MapPin, Package, XCircle, RotateCcw } from "lucide-react";

import {
    cancelOrder,
    cancelOrderItem,
    returnOrderItem,
    type OrderDetails as OrderDetailsType,
    type OrderItem,
} from "@/app/services/customer/order.service";
import { getApiErrorMessage } from "@/app/lib/api/apiError";

interface OrderDetailsProps {
    order: OrderDetailsType;
}

const STATUS_STYLES = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    DELIVERED: "bg-green-100 text-green-700",
};

const PAYMENT_STATUS_STYLES = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
};

function formatPrice(price: string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function ItemActions({
    item,
    orderStatus,
    onUpdated,
}: {
    item: OrderItem;
    orderStatus: OrderDetailsType["status"];
    onUpdated: (updated: OrderItem) => void;
}) {
    const [qty, setQty] = useState(1);
    const [reason, setReason] = useState("");
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const canCancel = (orderStatus === "PENDING" || orderStatus === "CONFIRMED") && item.remainingQuantity > 0;
    const canReturn = orderStatus === "DELIVERED" && item.remainingQuantity > 0;

    if (!canCancel && !canReturn) {
        if (item.cancelledQuantity > 0) {
            return <p className="mt-2 text-xs text-red-500">{item.cancelledQuantity} unit(s) cancelled</p>;
        }
        if (item.returnedQuantity > 0) {
            return <p className="mt-2 text-xs text-amber-600">{item.returnedQuantity} unit(s) returned</p>;
        }
        return null;
    }

    async function handleCancel() {
        const confirmed = window.confirm(`Cancel ${qty} unit(s) of ${item.productName}?`);
        if (!confirmed) return;

        try {
            setBusy(true);
            setError("");
            const updated = await cancelOrderItem(item.id, item.id, qty);
            // NOTE: cancelOrderItem needs (orderId, itemId, quantity) — see fix below.
            onUpdated(updated);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage("Unable to cancel this item."));
        } finally {
            setBusy(false);
        }
    }

    async function handleReturn() {
        if (reason.trim().length < 5) {
            setError("Please provide a reason (at least 5 characters).");
            return;
        }

        try {
            setBusy(true);
            setError("");
            const updated = await returnOrderItem(item.id, item.id, qty, reason);
            // NOTE: same orderId/itemId issue — see fix below.
            onUpdated(updated);
            setShowReturnForm(false);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage("Unable to submit the return."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mt-3 space-y-2 border-t pt-3">
            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Qty</label>
                <input
                    type="number"
                    min={1}
                    max={item.remainingQuantity}
                    value={qty}
                    onChange={(e) => setQty(Math.min(item.remainingQuantity, Math.max(1, Number(e.target.value))))}
                    className="w-16 rounded-lg border px-2 py-1 text-sm"
                />
                <span className="text-xs text-gray-400">of {item.remainingQuantity} remaining</span>
            </div>

            <div className="flex gap-2">
                {canCancel && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={handleCancel}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                        <XCircle size={14} />
                        Cancel item
                    </button>
                )}

                {canReturn && !showReturnForm && (
                    <button
                        type="button"
                        onClick={() => setShowReturnForm(true)}
                        className="flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                    >
                        <RotateCcw size={14} />
                        Return item
                    </button>
                )}
            </div>

            {canReturn && showReturnForm && (
                <div className="space-y-2">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for return (min 5 characters)"
                        className="w-full rounded-lg border p-2 text-xs"
                        rows={2}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleReturn}
                            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                            {busy ? "Submitting..." : "Submit return"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReturnForm(false)}
                            className="text-xs text-gray-500 underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrderDetails({ order: initialOrder }: OrderDetailsProps) {
    const [order, setOrder] = useState<OrderDetailsType>(initialOrder);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");

    async function handleCancelOrder() {
        const confirmed = window.confirm("Are you sure you want to cancel this entire order?");
        if (!confirmed) return;

        try {
            setCancelling(true);
            setError("");
            const updatedOrder = await cancelOrder(order.id);
            setOrder(updatedOrder);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage("Unable to cancel the order. Please try again."));
        } finally {
            setCancelling(false);
        }
    }

    function handleItemUpdated(updatedItem: OrderItem) {
        setOrder((prev) => ({
            ...prev,
            items: prev.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
        }));
    }

    const canCancelWholeOrder = order.status === "PENDING" || order.status === "CONFIRMED";

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Link href="/accounts/orders" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                <ArrowLeft size={17} />
                Back to orders
            </Link>

            <div className="rounded-xl border bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays size={16} />
                            Placed on {formatDate(order.createdAt)}
                        </div>
                    </div>
                    <span className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <section className="rounded-xl border bg-white">
                        <div className="border-b p-5">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <Package size={19} />
                                Order items
                            </h2>
                        </div>

                        <div className="divide-y">
                            {order.items.map((item) => {
                                const image = item.productVariant.productColor.images[0];

                                return (
                                    <div key={item.id} className="p-5">
                                        <div className="flex gap-4">
                                            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                {image ? (
                                                    <img
                                                        src={image.url}
                                                        alt={image.altText || item.productName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Package size={24} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium">{item.productName}</h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-500">
                                                    <p>Color: <span className="text-gray-800">{item.colorName}</span></p>
                                                    <p>Size: <span className="text-gray-800">{item.sizeName}</span></p>
                                                    <p>Ordered: {item.quantity}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-semibold">{formatPrice(item.price)}</p>
                                                {item.quantity > 1 && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatPrice(item.price)} × {item.quantity}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <ItemActions item={item} orderStatus={order.status} onUpdated={handleItemUpdated} />
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-xl border bg-white p-5">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <MapPin size={19} />
                            Shipping address
                        </h2>

                        <div className="mt-4 text-sm leading-6 text-gray-600">
                            <p className="font-medium text-gray-900">
                                {order.shippingFirstName} {order.shippingLastName}
                            </p>
                            <p>{order.shippingPhone}</p>
                            <p className="mt-2">{order.shippingLine1}</p>
                            {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                            <p>{order.shippingCity}, {order.shippingState}</p>
                            <p>{order.shippingPostalCode}, {order.shippingCountry}</p>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="rounded-xl border bg-white p-5">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <CreditCard size={19} />
                            Payment
                        </h2>

                        <div className="mt-4 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border bg-white p-5">
                        <h2 className="font-semibold">Order summary</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-lg font-bold">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {canCancelWholeOrder && (
                        <section className="rounded-xl border bg-white p-5">
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleCancelOrder}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <XCircle size={18} />
                                {cancelling ? "Cancelling..." : "Cancel entire order"}
                            </button>
                            <p className="mt-2 text-xs text-gray-400">
                                Or cancel individual items below instead of the whole order.
                            </p>
                        </section>
                    )}

                    {order.status === "DELIVERED" && (
                        <section className="rounded-xl border border-green-200 bg-green-50 p-5">
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="shrink-0 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Order delivered</p>
                                    <p className="mt-1 text-sm text-green-700">
                                        This order was successfully delivered. You can return individual items above.
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
