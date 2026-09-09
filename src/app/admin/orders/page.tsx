// app/admin/orders/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getOrders,
  type ListOrdersParams,
  type OrderListItem,
  type OrderPagination,
  type OrderStatus,
} from "@/app/services/admin/order.service";
import { listOrdersQuerySchema } from "@/app/validations/admin/order.validation";
import { getApiErrorMessage } from "@/app/lib/api/apiError"
import OrderFilters from "./components/OrderFilters";
import OrderTable from "./components/OrderTable";

const DEFAULT_FILTERS: ListOrdersParams = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [pagination, setPagination] = useState<OrderPagination | null>(null);
  const [filters, setFilters] = useState<ListOrdersParams>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    // Validate the outgoing filter object against the shared schema
    // BEFORE calling the API. If this fails, it means a bug in this
    // component built a malformed filters object — surface it rather
    // than sending garbage to the backend and letting its 400 do the work.
    const result = listOrdersQuerySchema.safeParse(filters);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid filters.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getOrders(result.data);
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load orders. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Backend is the source of truth for nextStatuses after a status change —
  // just refetch, no optimistic patch that gets immediately thrown away.
  const handleStatusUpdated = () => {
    fetchOrders();
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const goToPage = (page: number) => setFilters((current) => ({ ...current, page }));

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pagination ? `${pagination.total} orders placed` : "Loading orders..."}
        </p>
      </div>

      <OrderFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        totalCount={pagination?.total}
        // statusCounts intentionally omitted — see the note in OrderFilters.tsx.
        // Add it once the backend exposes a per-status count aggregate.
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <OrderTable orders={orders} loading={loading} onStatusUpdated={handleStatusUpdated} />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => goToPage(pagination.page - 1)}
              className="h-9 rounded-full border border-border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.page + 1)}
              className="h-9 rounded-full border border-border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}