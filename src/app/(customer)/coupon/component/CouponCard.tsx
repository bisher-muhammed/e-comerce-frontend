"use client";

import { Check, Copy, Tag } from "lucide-react";
import { useState } from "react";

import type { CustomerCoupon } from "@/app/services/customer/coupon.service";

interface CouponCardProps {
  coupon: CustomerCoupon;
  claiming: boolean;
  onClaim: (coupon: CustomerCoupon) => Promise<void>;
}

export default function CouponCard({
  coupon,
  claiming,
  onClaim,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false);

  const discountValue = Number(coupon.discountValue);

  const minimumOrderAmount = Number(
    coupon.minimumOrderAmount
  );

  const maximumDiscountAmount =
    coupon.maximumDiscountAmount !== null
      ? Number(coupon.maximumDiscountAmount)
      : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard may not be available in every browser/context.
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Tag size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">
              {coupon.name}
            </h3>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Valid until{" "}
              {new Date(
                coupon.expiresOn
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        {coupon.isClaimed && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium">
            <Check size={11} />
            Claimed
          </div>
        )}
      </div>

      {/* DISCOUNT */}

      <div className="space-y-4 px-5 py-5">
        <div>
          <p className="text-2xl font-semibold tracking-tight">
            {coupon.discountType === "PERCENTAGE"
              ? `${discountValue}% OFF`
              : `₹${discountValue.toFixed(2)} OFF`}
          </p>

          {coupon.discountType === "PERCENTAGE" &&
            maximumDiscountAmount !== null && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Maximum discount ₹
                {maximumDiscountAmount.toFixed(2)}
              </p>
            )}
        </div>

        {/* CODE */}

        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/50 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">
              Coupon code
            </p>

            <p className="mt-1 truncate font-mono text-sm font-semibold tracking-wide">
              {coupon.code}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-2 text-[10px] font-medium transition-colors hover:border-foreground"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* REQUIREMENTS */}

        <div className="space-y-1.5 text-[11px] text-muted-foreground">
          {minimumOrderAmount > 0 && (
            <p>
              Minimum order value: ₹
              {minimumOrderAmount.toFixed(2)}
            </p>
          )}

          {coupon.discountType === "PERCENTAGE" &&
            maximumDiscountAmount !== null && (
              <p>
                Maximum discount: ₹
                {maximumDiscountAmount.toFixed(2)}
              </p>
            )}
        </div>

        {/* CLAIM */}

        <button
          type="button"
          onClick={() => onClaim(coupon)}
          disabled={coupon.isClaimed || claiming}
          className="w-full rounded-lg bg-foreground px-4 py-3 text-xs font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {claiming
            ? "Claiming..."
            : coupon.isClaimed
              ? "Coupon claimed"
              : "Claim coupon"}
        </button>
      </div>
    </div>
  );
}