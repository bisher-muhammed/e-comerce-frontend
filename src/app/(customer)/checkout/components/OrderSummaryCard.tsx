
"use client";

import Image from "next/image";

import { useState } from "react";

import {
  Check,
  ShieldCheck,
  X,
} from "lucide-react";

import type { Cart } from "@/app/services/customer/cart.service";

import {
  validateCoupon,
  type CouponValidationResult,
} from "@/app/services/customer/coupon.service";

import { getApiErrorMessage } from "@/app/lib/api/apiError";
import type { CheckoutTotals } from "./types";

interface OrderSummaryCardProps {
  cart: Cart;
  totals: CheckoutTotals;

  /**
   * Coupon state belongs to CheckoutPage because
   * checkout creation needs to know which coupon
   * was applied.
   */
  appliedCoupon: CouponValidationResult | null;

  onCouponChange: (
    coupon: CouponValidationResult | null
  ) => void;
}

export function OrderSummaryCard({
  cart,
  totals,
  appliedCoupon,
  onCouponChange,
}: OrderSummaryCardProps) {
  const { subtotal, discountAmount, total } =
    totals;

  const [promoCode, setPromoCode] = useState("");
  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  // ============================================================
  // APPLY COUPON
  // ============================================================

  const handleApplyPromo = async () => {
    const code = promoCode.trim();

    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const result = await validateCoupon({
        code,
        subtotal,
      });

      /**
       * IMPORTANT:
       *
       * The parent now knows about the coupon.
       * This means checkout can send couponCode
       * to the backend.
       */
      onCouponChange(result);

      /**
       * Keep the normalized code in the input state.
       */
      setPromoCode(result.coupon.code);
    } catch (error) {
      onCouponChange(null);

      setCouponError(
        getApiErrorMessage(
          error,
          "Unable to apply coupon"
        )
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const handleRemoveCoupon = () => {
    /**
     * This only removes the coupon from the
     * current checkout attempt.
     *
     * It does NOT remove the user's CouponClaim.
     */
    onCouponChange(null);

    setCouponError("");
    setPromoCode("");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-border px-6 py-5">
        <h2 className="text-base font-semibold">
          Your order
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          {cart.items.length}{" "}
          {cart.items.length === 1
            ? "product"
            : "products"}
        </p>
      </div>

      {/* ======================================================
          ITEMS
      ====================================================== */}

      <div className="space-y-4 border-b border-border px-6 py-5">
        {cart.items.map((item) => {
          const product =
            item.productVariant.productColor.product;

          const color =
            item.productVariant.productColor.color;

          const size =
            item.productVariant.size;

          const images =
            item.productVariant.productColor.images;

          const image =
            images.find(
              (img) => img.isPrimary
            ) ?? images[0];

          const itemTotal = Number(item.lineTotal);

          return (
            <div
              key={item.id}
              className="flex gap-3"
            >
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                {image && (
                  <Image
                    src={image.url}
                    alt={
                      image.altText ??
                      product.name
                    }
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}

                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[9px] text-background">
                  {item.quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {product.name}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {color.name} · {size.name}
                </p>
              </div>

              <p className="text-xs font-medium">
                ₹{itemTotal.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* ======================================================
          COUPON
      ====================================================== */}

      <div className="space-y-3 border-b border-border px-6 py-5">
        {appliedCoupon ? (
          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Check size={13} />

                  <p className="text-xs font-medium">
                    Coupon applied
                  </p>
                </div>

                <p className="mt-1 font-mono text-xs font-semibold">
                  {appliedCoupon.coupon.code}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {appliedCoupon.coupon.name}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Remove coupon"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(
                    e.target.value.toUpperCase()
                  );

                  setCouponError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyPromo();
                  }
                }}
                placeholder="Promo code"
                disabled={couponLoading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs uppercase outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={
                  couponLoading ||
                  !promoCode.trim()
                }
                className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-xs font-medium transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {couponLoading
                  ? "Checking..."
                  : "Apply"}
              </button>
            </div>

            {couponError && (
              <p className="text-[11px] text-muted-foreground">
                {couponError}
              </p>
            )}
          </>
        )}
      </div>

      {/* ======================================================
          TOTALS
      ====================================================== */}

      <div className="space-y-3 px-6 py-5 text-sm">
        {/* SUBTOTAL */}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Subtotal
          </span>

          <span>
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        {/* DISCOUNT */}

        {appliedCoupon &&
          discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Coupon discount
              </span>

              <span>
                -₹{discountAmount.toFixed(2)}
              </span>
            </div>
          )}

        {/* SHIPPING */}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Shipping
          </span>

          <span className="text-xs font-medium">
            Free
          </span>
        </div>

        {/* TOTAL */}

        <div className="border-t border-border pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold">
                Total
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                Inclusive of applicable taxes
              </p>
            </div>

            <div className="text-right">
              {appliedCoupon &&
                discountAmount > 0 && (
                  <p className="mb-1 text-xs text-muted-foreground line-through">
                    ₹{subtotal.toFixed(2)}
                  </p>
                )}

              <p className="text-xl font-semibold tracking-tight">
                ₹{total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SECURITY
      ====================================================== */}

      <div className="flex items-center justify-center gap-2 border-t border-border px-6 py-4 text-[10px] text-muted-foreground">
        <ShieldCheck size={12} />

        <span>
          Secure & encrypted checkout
        </span>
      </div>
    </div>
  );
}
