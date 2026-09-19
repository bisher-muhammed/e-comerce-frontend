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
        let mounted = true;

        async function loadOrder() {
            // ====================================================
            // VALIDATE ORDER ID
            // ====================================================

            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                if (!mounted) return;

                setError("Invalid order ID.");
                setOrder(null);
                setLoading(false);

                return;
            }

            try {
                if (!mounted) return;

                setLoading(true);
                setError("");

                const data =
                    await getOrderById(orderId);

                if (!mounted) return;

                setOrder(data);
            } catch (error) {
                if (!mounted) return;

                console.error(
                    "Failed to load order:",
                    error
                );

                setOrder(null);

                setError(
                    getApiErrorMessage(
                        error,
                        "Unable to load this order."
                    )
                );
            } finally {
                if (!mounted) return;

                setLoading(false);
            }
        }

        loadOrder();

        return () => {
            mounted = false;
        };
    }, [orderId]);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 py-10">
                <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                    Loading order...
                </div>
            </div>
        );
    }

    // ========================================================
    // ERROR / NOT FOUND
    // ========================================================

    if (error || !order) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 py-10">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-600">
                        {error || "Order not found."}
                    </p>
                </div>
            </div>
        );
    }

    // ========================================================
    // ORDER DETAILS
    // ========================================================

    return (
        <div className="w-full">
            <OrderDetails order={order} />
        </div>
    );
}