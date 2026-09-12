"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import CouponCard from "@/app/(customer)/coupon/component/CouponCard";

import {
  getAvailableCoupons,
  claimCoupon,
  type CustomerCoupon,
} from "@/app/services/customer/coupon.service";

import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { optionalAuthRequest } from "@/app/lib/api/apiPrivate";

function CouponCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="h-20 animate-pulse bg-secondary" />

      <div className="space-y-4 p-5">
        <div className="h-7 w-32 animate-pulse rounded bg-secondary" />

        <div className="h-12 animate-pulse rounded-lg bg-secondary" />

        <div className="h-10 animate-pulse rounded-lg bg-secondary" />
      </div>
    </div>
  );
}

export default function HomeCoupons() {
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingCode, setClaimingCode] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        /*
         * Coupons are shown on the public home page, so a guest 401
         * has to leave them where they are.
         */
        const data = await getAvailableCoupons(optionalAuthRequest);

        if (!cancelled) setCoupons(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(err, "Unable to load coupons")
          );

          setCoupons([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaimCoupon = async (coupon: CustomerCoupon) => {
    try {
      setClaimingCode(coupon.code);
      setError("");

      await claimCoupon(coupon.code);

      const data = await getAvailableCoupons(optionalAuthRequest);

      setCoupons(data);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, "Unable to claim coupon")
      );
    } finally {
      setClaimingCode(null);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-6 border-b border-border pb-5">
          <div className="h-6 w-48 animate-pulse rounded bg-secondary" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-secondary" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <CouponCardSkeleton key={item} />
          ))}
        </div>
      </section>
    );
  }

  if (error || coupons.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Coupons &amp; Offers
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Claim an offer and save on your next order.
          </p>
        </div>

        <Link
          href="/coupon"
          className="hidden items-center gap-1 text-xs font-medium text-foreground transition-opacity hover:opacity-60 sm:flex"
        >
          View all
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.slice(0, 3).map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            claiming={claimingCode === coupon.code}
            onClaim={handleClaimCoupon}
          />
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link
          href="/coupon"
          className="flex items-center justify-center gap-1 border border-border px-4 py-3 text-xs font-medium transition-colors hover:border-foreground"
        >
          View all coupons
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
