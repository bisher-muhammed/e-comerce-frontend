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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrder() {
            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                setError(getApiErrorMessage("Invalid order ID."));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getOrderById(
                    orderId
                );

                setOrder(data);
            } catch (error) {
                console.error(error);

                setError(getApiErrorMessage("Unable to load this order."));
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [orderId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />

                    <div className="h-32 animate-pulse rounded-xl bg-gray-200" />

                    <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="rounded-xl border bg-white p-8 text-center">
                    <h1 className="text-lg font-semibold">
                        Order not found
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {error ||
                            "We couldn't find this order."}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <OrderDetails order={order} />
        </main>
    );
}
