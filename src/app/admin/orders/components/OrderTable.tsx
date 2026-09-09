"use client";

import Link from "next/link";

import {
    ChevronRight,
    Loader2,
    PackageSearch,
} from "lucide-react";

import type {
    OrderListItem,
    OrderStatus,
} from "@/app/services/admin/order.service";

import OrderStatusBadge from "./OrderStatusBadge";
import OrderStatusSelect from "./OrderStatusSelect";

interface OrderTableProps {
    orders: OrderListItem[];
    loading: boolean;
    onStatusUpdated: (
        orderId: number,
        status: OrderStatus
    ) => void;
}

export default function OrderTable({
    orders,
    loading,
    onStatusUpdated,
}: OrderTableProps) {
    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-card">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
                <PackageSearch className="h-8 w-8 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                    No orders found.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold">
                                #ORD-{order.id}
                            </span>

                            <OrderStatusBadge
                                status={order.status}
                            />
                        </div>

                        <span className="text-sm text-muted-foreground">
                            {new Date(
                                order.createdAt
                            ).toLocaleDateString(
                                undefined,
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}
                        </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Customer */}
                        <div className="min-w-0">
                            <p className="font-medium">
                                {order.user.firstName}{" "}
                                {order.user.lastName ?? ""}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {order.contactEmail}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {order.paymentMethod}
                                {" · "}
                                {order.paymentStatus}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-lg font-semibold">
                                ₹
                                {Number(
                                    order.total
                                ).toFixed(2)}
                            </span>

                            <OrderStatusSelect
                                orderId={order.id}
                                currentStatus={
                                    order.status
                                }
                                nextStatuses={
                                    order.nextStatuses
                                }
                                onUpdated={(status) =>
                                    onStatusUpdated(
                                        order.id,
                                        status
                                    )
                                }
                            />

                            <Link
                                href={`/admin/orders/${order.id}`}
                                className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-4 text-sm hover:bg-accent"
                            >
                                View

                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
