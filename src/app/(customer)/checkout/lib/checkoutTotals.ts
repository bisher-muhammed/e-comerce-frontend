import type { Cart } from "@/app/services/customer/cart.service";
import type { CouponValidationResult } from "@/app/services/customer/coupon.service";

import type { CheckoutTotals } from "../components/types";

export function toPaise(value: string | number): number {
  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100);
}

export const fromPaise = (paise: number): number => paise / 100;

export const formatPaiseAmount = (paise: number): string =>
  (paise / 100).toFixed(2);

export function computeCheckoutTotals(
  cart: Pick<Cart, "subtotal">,
  coupon: Pick<
    CouponValidationResult,
    "subtotal" | "discountAmount"
  > | null
): CheckoutTotals {
  const subtotalPaise = Math.max(toPaise(cart.subtotal), 0);

  const couponStale =
    coupon !== null && toPaise(coupon.subtotal) !== subtotalPaise;

  const discountPaise =
    coupon && !couponStale
      ? Math.min(Math.max(toPaise(coupon.discountAmount), 0), subtotalPaise)
      : 0;

  const totalPaise = subtotalPaise - discountPaise;

  return {
    subtotal: fromPaise(subtotalPaise),
    discountAmount: fromPaise(discountPaise),
    total: fromPaise(totalPaise),
    expectedTotal: formatPaiseAmount(totalPaise),
    couponStale,
  };
}
