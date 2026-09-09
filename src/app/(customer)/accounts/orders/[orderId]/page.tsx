"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
    getOrderById,
    type OrderDetails as OrderDetailsType,
} from "@/app/services/customer/order.service";

import OrderDetails from "../components/OrderDetails";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

export default function OrderDetailsPage() {
    const params = useParams();

    const orderId = Number(params.orderId);

    const [order, setOrder] =
        useState<OrderDetailsType | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function loadOrder() {
            // ------------------------------------------------
            // Validate order ID before making API request
            // ------------------------------------------------

            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                setError(
                    getApiErrorMessage(
                        "Invalid order ID."
                    )
                );

                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError("");

                const data =
                    await getOrderById(orderId);

                setOrder(data);
            } catch (error) {
                console.error(
                    "Failed to load order:",
                    error
                );

                setError(
                    getApiErrorMessage(
                        "Unable to load this order."
                    )
                );
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [orderId]);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10">
                <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                    Loading order...
                </div>
            </main>
        );
    }

    // ========================================================
    // ERROR / NOT FOUND
    // ========================================================

    if (error || !order) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-600">
                        {error || "Order not found."}
                    </p>
                </div>
            </main>
        );
    }

    // ========================================================
    // ORDER
    // ========================================================

    return (
        <OrderDetails order={order} />
    );
}
