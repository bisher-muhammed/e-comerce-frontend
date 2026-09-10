"use client";

import { useEffect } from "react";
import {
  Pencil,
  X,
} from "lucide-react";

import type {
  Coupon,
} from "@/app/services/admin/coupon.service";

type Props = {
  coupon: Coupon;

  onClose: () => void;

  onEdit: () => void;
};

export default function CouponDetails({
  coupon,
  onClose,
  onEdit,
}: Props) {
  // ============================================================
  // ESCAPE TO CLOSE
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ============================================================
  // HELPERS
  // ============================================================

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
        month: "long",
        year: "numeric",
      }
    );
  };

  const label =
    "text-xs uppercase tracking-wide text-[var(--muted-foreground)]";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >

      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Coupon details
            </h2>

            <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
              {coupon.code}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-none p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-6 p-6">

          {/* NAME + STATUS */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={label}>Name</p>
              <p className="mt-1 text-base font-medium text-[var(--foreground)]">
                {coupon.name}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-none border px-2 py-1 text-xs font-medium ${
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
              {coupon.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* CODE */}
          <div>
            <p className={label}>Code</p>

            <p className="mt-1 font-mono text-sm font-medium text-[var(--foreground)]">
              {coupon.code}
            </p>
          </div>

          {/* DISCOUNT */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <p className={label}>Discount type</p>

              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {coupon.discountType ===
                "PERCENTAGE"
                  ? "Percentage"
                  : "Fixed amount"}
              </p>
            </div>

            <div>
              <p className={label}>Discount value</p>

              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {coupon.discountType ===
                "PERCENTAGE"
                  ? `${Number(
                      coupon.discountValue
                    )}%`
                  : formatMoney(
                      coupon.discountValue
                    )}
              </p>
            </div>
          </div>

          {/* ORDER LIMITS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <p className={label}>Minimum order</p>

              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {formatMoney(
                  coupon.minimumOrderAmount
                )}
              </p>
            </div>

            <div>
              <p className={label}>Maximum discount</p>

              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {coupon.maximumDiscountAmount ===
                    null ||
                coupon.maximumDiscountAmount ===
                    undefined
                  ? "No limit"
                  : formatMoney(
                      coupon.maximumDiscountAmount
                    )}
              </p>
            </div>
          </div>

          {/* VALIDITY */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <p className={label}>Starts on</p>

              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {formatDate(
                  coupon.startsOn
                )}
              </p>
            </div>

            <div>
              <p className={label}>Expires on</p>

              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {formatDate(
                  coupon.expiresOn
                )}
              </p>
            </div>
          </div>

          {/* CLAIMS */}
          <div className="rounded-none border border-[var(--border)] bg-[var(--secondary)] p-4">

            <p className={label}>Total claims</p>

            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {coupon._count?.claims ??
                0}
            </p>
          </div>

          {/* CREATED / UPDATED */}
          <div className="grid grid-cols-1 gap-5 border-t border-[var(--border)] pt-5 sm:grid-cols-2">

            <div>
              <p className={label}>Created</p>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {formatDate(
                  coupon.createdAt
                )}
              </p>
            </div>

            <div>
              <p className={label}>Last updated</p>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {formatDate(
                  coupon.updatedAt
                )}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--secondary)]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-2 rounded-none bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
