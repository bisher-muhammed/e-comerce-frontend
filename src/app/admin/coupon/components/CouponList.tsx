"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Power,
  Trash2,
  Search,
  Ticket,
} from "lucide-react";

import type {
  Coupon,
} from "@/app/services/admin/coupon.service";

import type {
  CouponDiscountType,
  ListCouponsInput,
} from "@/app/validations/admin/coupon.validation";

type Props = {
  coupons: Coupon[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  filters: Partial<ListCouponsInput>;

  loading: boolean;

  onFilterChange: (
    filters: Partial<ListCouponsInput>
  ) => void;

  onPageChange: (page: number) => void;

  onView: (coupon: Coupon) => void;

  onEdit: (coupon: Coupon) => void;

  onToggleStatus: (
    coupon: Coupon
  ) => Promise<void>;

  onDelete: (coupon: Coupon) => void;
};

export default function CouponList({
  coupons,
  pagination,
  filters,
  loading,
  onFilterChange,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) {
  // ============================================================
  // DEBOUNCED SEARCH
  // A raw onChange -> onFilterChange fires a network request on
  // every keystroke. Keep a local echo of the input and only
  // push it upstream after the user pauses typing.
  // ============================================================

  const [searchInput, setSearchInput] = useState(
    filters.search ?? ""
  );

  useEffect(() => {
    setSearchInput(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== (filters.search ?? "")) {
        onFilterChange({
          search: trimmed === "" ? undefined : trimmed,
        });
      }
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const formatMoney = (
    value: string | number
  ) => {
    return `₹${Number(value).toFixed(2)}`;
  };

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const inputClass =
    "w-full rounded-none border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)]";

  return (
    <section className="overflow-hidden rounded-none border border-[var(--border)] bg-[var(--card)]">

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="border-b border-[var(--border)] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

          {/* SEARCH */}
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search name or code"
              className={`${inputClass} pl-9`}
            />
          </div>

          {/* DISCOUNT TYPE */}
          <select
            value={
              filters.discountType ?? ""
            }
            onChange={(event) => {
              const value =
                event.target.value;

              onFilterChange({
                discountType:
                  value === ""
                    ? undefined
                    : (value as CouponDiscountType),
              });
            }}
            className={inputClass}
          >
            <option value="">
              All types
            </option>

            <option value="PERCENTAGE">
              Percentage
            </option>

            <option value="FIXED">
              Fixed
            </option>
          </select>

          {/* STATUS */}
          <select
            value={
              filters.isActive === undefined
                ? ""
                : filters.isActive
                  ? "true"
                  : "false"
            }
            onChange={(event) => {
              const value =
                event.target.value;

              onFilterChange({
                isActive:
                  value === ""
                    ? undefined
                    : value === "true",
              });
            }}
            className={inputClass}
          >
            <option value="">
              All statuses
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>
          </select>

          {/* ORDER BY */}
          <select
            value={
              filters.orderBy ??
              "createdAt"
            }
            onChange={(event) =>
              onFilterChange({
                orderBy:
                  event.target
                    .value as ListCouponsInput["orderBy"],
              })
            }
            className={inputClass}
          >
            <option value="createdAt">
              Created
            </option>

            <option value="updatedAt">
              Updated
            </option>

            <option value="name">
              Name
            </option>

            <option value="code">
              Code
            </option>

            <option value="startsOn">
              Start date
            </option>

            <option value="expiresOn">
              Expiry date
            </option>

            <option value="discountValue">
              Discount value
            </option>

            <option value="minimumOrderAmount">
              Minimum order
            </option>
          </select>

          {/* ORDER */}
          <select
            value={
              filters.order ?? "desc"
            }
            onChange={(event) =>
              onFilterChange({
                order:
                  event.target
                    .value as "asc" | "desc",
              })
            }
            className={inputClass}
          >
            <option value="desc">
              Newest first
            </option>

            <option value="asc">
              Oldest first
            </option>
          </select>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">

          <thead className="border-b border-[var(--border)] bg-[var(--secondary)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            <tr>
              <th className="px-5 py-3.5 font-medium">
                Coupon
              </th>

              <th className="px-5 py-3.5 font-medium">
                Discount
              </th>

              <th className="px-5 py-3.5 font-medium">
                Minimum
              </th>

              <th className="px-5 py-3.5 font-medium">
                Validity
              </th>

              <th className="px-5 py-3.5 font-medium">
                Claims
              </th>

              <th className="px-5 py-3.5 font-medium">
                Status
              </th>

              <th className="px-5 py-3.5 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">

            {/* LOADING SKELETON */}
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: 7 }).map((__, col) => (
                    <td key={col} className="px-5 py-4">
                      <div className="h-4 w-full max-w-[120px] animate-pulse rounded-none bg-[var(--secondary)]" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* EMPTY */}
            {!loading &&
              coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-20 text-center"
                  >
                    <Ticket
                      size={22}
                      className="mx-auto mb-3 text-[var(--muted-foreground)]"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      No coupons found
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Try adjusting your filters or create a new coupon.
                    </p>
                  </td>
                </tr>
              )}

            {/* COUPONS */}
            {!loading &&
              coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="transition hover:bg-[var(--accent)]"
                >

                  {/* COUPON */}
                  <td className="px-5 py-4">
                    <div className="font-medium text-[var(--foreground)]">
                      {coupon.name}
                    </div>

                    <div className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                      {coupon.code}
                    </div>
                  </td>

                  {/* DISCOUNT */}
                  <td className="px-5 py-4">
                    <div className="font-medium text-[var(--foreground)]">
                      {coupon.discountType ===
                      "PERCENTAGE"
                        ? `${Number(
                            coupon.discountValue
                          )}%`
                        : formatMoney(
                            coupon.discountValue
                          )}
                    </div>

                    {coupon.discountType ===
                      "PERCENTAGE" &&
                      coupon.maximumDiscountAmount !==
                        null &&
                      coupon.maximumDiscountAmount !==
                        undefined && (
                        <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                          Max{" "}
                          {formatMoney(
                            coupon.maximumDiscountAmount
                          )}
                        </div>
                      )}
                  </td>

                  {/* MINIMUM */}
                  <td className="px-5 py-4 text-[var(--foreground)]">
                    {formatMoney(
                      coupon.minimumOrderAmount
                    )}
                  </td>

                  {/* VALIDITY */}
                  <td className="px-5 py-4">
                    <div className="text-[var(--foreground)]">
                      {formatDate(
                        coupon.startsOn
                      )}
                    </div>

                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                      to{" "}
                      {formatDate(
                        coupon.expiresOn
                      )}
                    </div>
                  </td>

                  {/* CLAIMS */}
                  <td className="px-5 py-4 text-[var(--foreground)]">
                    {coupon._count?.claims ??
                      0}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-none border px-2 py-1 text-xs font-medium ${
                        coupon.isActive
                          ? "border-[#3F6B4F]/30 text-[#3F6B4F]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          coupon.isActive
                            ? "bg-[#3F6B4F]"
                            : "bg-[var(--muted-foreground)]"
                        }`}
                      />
                      {coupon.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">

                      {/* VIEW */}
                      <button
                        type="button"
                        onClick={() =>
                          onView(coupon)
                        }
                        title="View coupon"
                        aria-label="View coupon"
                        className="rounded-none p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      >
                        <Eye size={17} />
                      </button>

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(coupon)
                        }
                        title="Edit coupon"
                        aria-label="Edit coupon"
                        className="rounded-none p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      >
                        <Pencil size={17} />
                      </button>

                      {/* TOGGLE STATUS */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(
                            coupon
                          )
                        }
                        title={
                          coupon.isActive
                            ? "Deactivate coupon"
                            : "Activate coupon"
                        }
                        aria-label={
                          coupon.isActive
                            ? "Deactivate coupon"
                            : "Activate coupon"
                        }
                        className="rounded-none p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      >
                        <Power size={17} />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() =>
                          onDelete(coupon)
                        }
                        title="Delete coupon"
                        aria-label="Delete coupon"
                        className="rounded-none p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ====================================================== */}
      {/* PAGINATION */}
      {/* ====================================================== */}

      {!loading &&
        coupons.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-[var(--muted-foreground)]">
              Page{" "}
              <span className="font-medium text-[var(--foreground)]">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--foreground)]">
                {pagination.totalPages}
              </span>

              {" · "}

              {pagination.total} coupons
            </p>

            <div className="flex items-center gap-2">

              {/* PREVIOUS */}
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  onPageChange(
                    pagination.page - 1
                  )
                }
                aria-label="Previous page"
                className="rounded-none border border-[var(--border)] p-2 text-[var(--foreground)] transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              {/* NEXT */}
              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  onPageChange(
                    pagination.page + 1
                  )
                }
                aria-label="Next page"
                className="rounded-none border border-[var(--border)] p-2 text-[var(--foreground)] transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>

            </div>
          </div>
        )}
    </section>
  );
}
