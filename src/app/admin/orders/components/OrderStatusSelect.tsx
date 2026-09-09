// app/admin/orders/components/OrderStatusSelect.tsx

"use client";

import { useState } from "react";

import {
    updateOrderStatus,
    type OrderStatus,
} from "@/app/services/admin/order.service";

import { updateOrderStatusSchema } from "../../../validations/admin/order.validation";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

import ConfirmDialog from "./ConfirmDialog";

interface OrderStatusSelectProps {
    orderId: number;
    currentStatus: OrderStatus;
    nextStatuses: OrderStatus[];
    onUpdated: (status: OrderStatus) => void;
}

const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case "PENDING":
            return "Pending";

        case "CONFIRMED":
            return "Confirmed";

        case "DELIVERED":
            return "Delivered";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status;
    }
};

export default function OrderStatusSelect({
    orderId,
    currentStatus,
    nextStatuses,
    onUpdated,
}: OrderStatusSelectProps) {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

    const [reason, setReason] = useState("");

    const [idempotencyKey, setIdempotencyKey] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleChange = (value: OrderStatus) => {
        setError(null);

        /*
         * Generate the idempotency key when the status change is selected.
         *
         * The same key is then reused if the user clicks "Confirm"
         * multiple times because of a retry/network problem.
         */
        const newIdempotencyKey = crypto.randomUUID();

        setSelectedStatus(value);
        setIdempotencyKey(newIdempotencyKey);
        setReason("");
        setConfirmOpen(true);
    };

    const handleCancel = () => {
        if (loading) return;

        setSelectedStatus("");
        setReason("");
        setIdempotencyKey("");
        setConfirmOpen(false);
        setError(null);
    };

    const handleConfirm = async () => {
        if (!selectedStatus) {
            setError("Please select a status.");
            return;
        }

        const result = updateOrderStatusSchema.safeParse({
            status: selectedStatus,
            reason:
                selectedStatus === "CANCELLED"
                    ? reason
                    : undefined,
            idempotencyKey,
        });

        if (!result.success) {
            setError(
                result.error.issues[0]?.message ??
                    "Invalid status update."
            );

            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await updateOrderStatus(
                orderId,
                result.data.status,
                result.data.reason,
                result.data.idempotencyKey
            );

            onUpdated(response.data.status);

            setSelectedStatus("");
            setReason("");
            setIdempotencyKey("");
            setConfirmOpen(false);
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Failed to update order status."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const isCancellation = selectedStatus === "CANCELLED";

    return (
        <>
            <select
                value={selectedStatus}
                disabled={
                    loading || nextStatuses.length === 0
                }
                onChange={(e) => {
                    const value = e.target.value as OrderStatus;

                    if (value) {
                        handleChange(value);
                    }
                }}
                className="h-10 rounded-full border border-border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">
                    {nextStatuses.length === 0
                        ? "No actions available"
                        : "Change status"}
                </option>

                {nextStatuses.map((status) => (
                    <option key={status} value={status}>
                        {getStatusLabel(status)}
                    </option>
                ))}
            </select>

            <ConfirmDialog
                open={confirmOpen}
                title="Update order status?"
                description={
                    <>
                        <p>
                            Are you sure you want to change order{" "}
                            <strong>#{orderId}</strong> from{" "}
                            <strong>
                                {getStatusLabel(currentStatus)}
                            </strong>{" "}
                            to{" "}
                            <strong>
                                {selectedStatus
                                    ? getStatusLabel(selectedStatus)
                                    : ""}
                            </strong>
                            ?
                        </p>

                        {isCancellation && (
                            <div className="mt-4">
                                <label
                                    htmlFor={`cancellation-reason-${orderId}`}
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Cancellation reason
                                </label>

                                <textarea
                                    id={`cancellation-reason-${orderId}`}
                                    value={reason}
                                    disabled={loading}
                                    onChange={(e) =>
                                        setReason(e.target.value)
                                    }
                                    placeholder="Enter the reason for cancelling this order"
                                    maxLength={500}
                                    rows={4}
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />

                                <div className="mt-1 text-right text-xs text-muted-foreground">
                                    {reason.length}/500
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="mt-2 text-sm text-destructive">
                                {error}
                            </p>
                        )}
                    </>
                }
                confirmLabel="Update status"
                cancelLabel="Cancel"
                destructive={isCancellation}
                loading={loading}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );
}
