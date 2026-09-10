"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Package, CreditCard, Search } from "lucide-react";

import { getOrders, type OrderListItem } from "@/app/services/customer/order.service";
import {
    listOrdersSchema,
    type OrderStatus,
    type PaymentMethod,
    type PaymentStatus,
} from "@/app/validations/customer/order.validation";
import { getApiErrorMessage } from "@/app/lib/api/apiError";

interface OrderListProps {
    initialStatus?: OrderStatus;
}

const STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    DELIVERED: "bg-green-100 text-green-700",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
};

// Pull the search cap from the schema itself rather than hardcoding
// 100 here — if the server-side limit changes, this stays in sync
// instead of silently drifting and throwing on .parse().
const SEARCH_MAX_LENGTH =
    listOrdersSchema.shape.search.unwrap().maxLength ?? 100;

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatPrice(price: string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));
}

// yyyy-MM-dd for <input type="date">
function toDateInputValue(d: string | undefined) {
    return d ?? "";
}

export default function OrderList({ initialStatus }: OrderListProps) {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [page, setPage] = useState(1);

    const [status, setStatus] = useState<OrderStatus | undefined>(initialStatus);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [dateField, setDateField] = useState<"createdAt" | "updatedAt">("createdAt");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Debounce the free-text search so we don't fire a request per keystroke.
    useEffect(() => {
        const handle = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);

        return () => clearTimeout(handle);
    }, [searchInput]);

    useEffect(() => {
        async function loadOrders() {
            try {
                setLoading(true);
                setError("");

                // Guard against a startDate that's after endDate before
                // it ever reaches the schema/server — the schema doesn't
                // cross-check the two fields, so nothing else will catch this.
                if (startDate && endDate && startDate > endDate) {
                    setError("Start date must be before end date.");
                    setLoading(false);
                    return;
                }

                const result = await getOrders(page, 10, {
                    status,
                    search: search || undefined,
                    dateField,
                    startDate: startDate ? new Date(startDate).toISOString() : undefined,
                    endDate: endDate ? new Date(endDate).toISOString() : undefined,
                });

                setOrders(result.orders);
                setPagination(result.pagination);
            } catch (err) {
                console.error(err);
                setError(getApiErrorMessage(err, "Failed to load orders."));
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, [page, status, search, dateField, startDate, endDate]);

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by order ID or product..."
                    maxLength={SEARCH_MAX_LENGTH}
                    className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black"
                />
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => {
                            setStatus(tab.value);
                            setPage(1);
                        }}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                            status === tab.value ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Date filter */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <select
                    value={dateField}
                    onChange={(e) => setDateField(e.target.value as "createdAt" | "updatedAt")}
                    className="rounded-lg border px-3 py-2"
                >
                    <option value="createdAt">Order date</option>
                    <option value="updatedAt">Last updated</option>
                </select>

                <input
                    type="date"
                    value={toDateInputValue(startDate)}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border px-3 py-2"
                />

                <span className="text-gray-400">to</span>

                <input
                    type="date"
                    value={toDateInputValue(endDate)}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border px-3 py-2"
                />

                {(startDate || endDate) && (
                    <button
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                        }}
                        className="text-gray-500 underline"
                    >
                        Clear dates
                    </button>
                )}
            </div>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-32 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button onClick={() => setPage(page)} className="mt-3 text-sm font-medium text-red-700 underline">
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <div className="rounded-xl border bg-white p-12 text-center">
                    <Package size={42} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-lg font-semibold">No orders found</h2>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search.</p>
                </div>
            )}

            {!loading &&
                !error &&
                orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/accounts/orders/${order.id}`}
                        className="block rounded-xl border bg-white p-5 transition hover:shadow-md"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Order #{order.id}</p>
                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                    <CalendarDays size={15} />
                                    {formatDate(order.createdAt)}
                                </div>
                            </div>

                            <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-gray-500">Items</p>
                                <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                                    <Package size={15} />
                                    {order._count.items}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Payment</p>
                                <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                                    <CreditCard size={15} />
                                    {order.paymentMethod}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Payment status</p>
                                <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="mt-1 text-sm font-semibold">{formatPrice(order.total)}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-1 text-sm font-medium">
                            View order
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                ))}

            {!loading && !error && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-5">
                    <button
                        disabled={page === 1}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => p - 1);
                        }}
                        className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-500">
                        Page {page} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={page === pagination.totalPages}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => p + 1);
                        }}
                        className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
