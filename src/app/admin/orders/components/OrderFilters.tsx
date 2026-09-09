// app/admin/orders/components/OrderFilters.tsx
"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type {
  ListOrdersParams,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/app/services/admin/order.service";
import { listOrdersQuerySchema } from "@/app/validations/admin/order.validation";

interface OrderFiltersProps {
  filters: ListOrdersParams;
  onChange: (filters: ListOrdersParams) => void;
  onReset: () => void;
  // Optional per-status counts for the tab badges, e.g. { PENDING: 1, ... }.
  // Left optional and undefined-safe on purpose: your backend doesn't
  // currently return status counts (listOrders only counts the filtered
  // set), so until you add that aggregate query, tabs just won't show a
  // number. I'm not fabricating counts to match the screenshot.
  statusCounts?: Partial<Record<OrderStatus, number>>;
  totalCount?: number;
}

const STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrderFilters({
  filters,
  onChange,
  onReset,
  statusCounts,
  totalCount,
}: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounced, validated search. Runs the shared zod schema's `search`
  // field validation before ever calling onChange (and therefore before
  // any network request happens).
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === (filters.search ?? "")) return;

    const handle = setTimeout(() => {
      const result = listOrdersQuerySchema.shape.search.safeParse(trimmed || undefined);

      if (!result.success) {
        setSearchError(result.error.issues[0]?.message ?? "Invalid search");
        return;
      }

      setSearchError(null);
      onChange({ ...filters, search: result.data, page: 1 });
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="space-y-4">
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order ID, product, or status..."
            className="h-12 w-full rounded-full border border-border bg-muted/30 pl-11 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        {searchError && <p className="mt-1 pl-4 text-xs text-destructive">{searchError}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const active = filters.status === tab.value;
            const count = tab.value ? statusCounts?.[tab.value] : totalCount;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => onChange({ ...filters, status: tab.value, page: 1 })}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {tab.label}
                {typeof count === "number" && (
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active ? "bg-background/20" : "bg-background"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.paymentMethod ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                paymentMethod: (e.target.value as PaymentMethod) || undefined,
                page: 1,
              })
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="">All methods</option>
            <option value="COD">COD</option>
            <option value="ONLINE">Online</option>
          </select>

          <select
            value={filters.paymentStatus ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                paymentStatus: (e.target.value as PaymentStatus) || undefined,
                page: 1,
              })
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="">All payments</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearchError(null);
              onReset();
            }}
            className="h-10 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}