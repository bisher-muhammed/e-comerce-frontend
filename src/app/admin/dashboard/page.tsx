"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Loader2,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

import {
  getOrders,
  type OrderListItem,
} from "@/app/services/admin/order.service";
import { getProducts } from "@/app/services/admin/product.service";
import { getCustomers } from "@/app/services/admin/user.service";
import { getApiErrorMessage } from "@/app/lib/api/apiError";

import OrderStatusBadge from "../orders/components/OrderStatusBadge";

const RECENT_ORDERS_LIMIT = 5;

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: OrderListItem[];
}

const formatCount = (value: number): string =>
  value.toLocaleString("en-IN");

const formatAmount = (value: string): string =>
  `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const customerName = (order: OrderListItem): string =>
  [order.user.firstName, order.user.lastName]
    .filter(Boolean)
    .join(" ") || order.contactEmail;

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [recent, pending, products, customers] =
        await Promise.all([
          getOrders({
            page: 1,
            limit: RECENT_ORDERS_LIMIT,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          getOrders({ page: 1, limit: 1, status: "PENDING" }),
          getProducts({ page: 1, limit: 1 }),
          getCustomers({ page: 1, limit: 1 }),
        ]);

      setData({
        totalOrders: recent.pagination.total,
        pendingOrders: pending.pagination.total,
        totalProducts: products.data?.pagination?.total ?? 0,
        totalCustomers: customers.data.pagination.total,
        recentOrders: recent.orders,
      });
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load the dashboard.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data
    ? [
        {
          label: "Orders",
          value: formatCount(data.totalOrders),
          icon: ShoppingBag,
          href: "/admin/orders",
        },
        {
          label: "Pending orders",
          value: formatCount(data.pendingOrders),
          icon: Clock,
          href: "/admin/orders",
        },
        {
          label: "Products",
          value: formatCount(data.totalProducts),
          icon: Package,
          href: "/admin/products",
        },
        {
          label: "Customers",
          value: formatCount(data.totalCustomers),
          icon: Users,
          href: "/admin/customer",
        },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          An overview of your store right now.
        </p>
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center border border-border bg-card">
          <Loader2
            className="h-6 w-6 animate-spin text-muted-foreground"
            aria-hidden="true"
          />

          <span className="sr-only">Loading dashboard</span>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-3 border border-border bg-card p-6 text-center"
        >
          <AlertTriangle
            className="h-8 w-8 text-destructive"
            aria-hidden="true"
          />

          <p className="text-sm text-muted-foreground">{error}</p>

          <button
            type="button"
            onClick={load}
            className="border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Stats */}
          <section
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              sm:gap-4
              2xl:grid-cols-4
            "
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="
                    min-w-0
                    border
                    border-border
                    bg-card
                    p-4
                    transition-colors
                    hover:border-foreground/30
                    sm:p-5
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>

                      <p className="mt-2 truncate text-xl font-medium tracking-tight sm:text-2xl">
                        {stat.value}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        bg-secondary
                      "
                    >
                      <Icon
                        className="h-[17px] w-[17px]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>

          {/* Main content */}
          <section
            className="
              mt-6
              grid
              grid-cols-1
              gap-6
              2xl:grid-cols-[minmax(0,1fr)_320px]
            "
          >
            {/* Recent Orders */}
            <div
              className="
                min-w-0
                overflow-hidden
                border
                border-border
                bg-card
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-border
                  px-4
                  py-4
                  sm:px-5
                "
              >
                <div className="min-w-0">
                  <h2 className="text-base font-medium">
                    Recent orders
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Latest customer orders
                  </p>
                </div>

                <Link
                  href="/admin/orders"
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1
                    text-xs
                    font-medium
                    underline
                    underline-offset-4
                  "
                >
                  View all
                  <ArrowUpRight
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {data.recentOrders.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No orders yet.
                </p>
              ) : (
                <>
                  {/* Desktop / tablet table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[650px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                            Order
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                            Customer
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                            Date
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                            Amount
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.recentOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-5 py-4 text-sm font-medium">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="underline underline-offset-4"
                              >
                                #ORD-{order.id}
                              </Link>
                            </td>

                            <td className="px-5 py-4 text-sm">
                              {customerName(order)}
                            </td>

                            <td className="px-5 py-4 text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              {formatAmount(order.total)}
                            </td>

                            <td className="px-5 py-4">
                              <OrderStatusBadge
                                status={order.status}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-border md:hidden">
                    {data.recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="block space-y-3 p-4 transition-colors hover:bg-secondary sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">
                            #ORD-{order.id}
                          </p>

                          <OrderStatusBadge
                            status={order.status}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Customer
                            </p>

                            <p className="mt-1 truncate">
                              {customerName(order)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Amount
                            </p>

                            <p className="mt-1 font-medium">
                              {formatAmount(order.total)}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Quick actions */}
            <div className="min-w-0 border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-medium">
                  Quick actions
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Frequently used actions
                </p>
              </div>

              <div className="space-y-2 p-4">
                {[
                  { label: "Add product", href: "/admin/products" },
                  { label: "View orders", href: "/admin/orders" },
                  {
                    label: "Manage categories",
                    href: "/admin/categories",
                  },
                  { label: "Manage admins", href: "/admin/admins" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="
                      flex
                      items-center
                      justify-between
                      border
                      border-border
                      px-4
                      py-3
                      text-sm
                      transition-colors
                      hover:bg-secondary
                    "
                  >
                    <span>{action.label}</span>
                    <ArrowUpRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
