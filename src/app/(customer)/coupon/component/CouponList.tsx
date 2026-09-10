"use client";

import type { CustomerCoupon } from "@/app/services/customer/coupon.service";

import CouponCard from "./CouponCard";

interface CouponListProps {
  coupons: CustomerCoupon[];
  claimingCode: string | null;
  onClaim: (coupon: CustomerCoupon) => Promise<void>;
}

export default function CouponList({
  coupons,
  claimingCode,
  onClaim,
}: CouponListProps) {
  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
        <p className="text-sm font-medium">
          No coupons available
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Check back later for new offers.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          claiming={claimingCode === coupon.code}
          onClaim={onClaim}
        />
      ))}
    </div>
  );
}