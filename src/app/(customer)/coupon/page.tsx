"use client";

import { useCallback, useEffect, useState } from "react";

import {
  claimCoupon,
  getAvailableCoupons,
  type CustomerCoupon,
} from "@/app/services/customer/coupon.service";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

import CouponList from "./component/CouponList";


export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);

  const [loading, setLoading] = useState(true);
  const [claimingCode, setClaimingCode] = useState<string | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAvailableCoupons();

      setCoupons(data);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ============================================================
  // CLAIM
  // ============================================================

  const handleClaim = async (coupon: CustomerCoupon) => {
    try {
      setClaimingCode(coupon.code);
      setError(null);

      await claimCoupon(coupon.code);

      await fetchCoupons();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setClaimingCode(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-muted-foreground">
            Loading coupons...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Coupons & Offers
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Claim available coupons and save on your next order.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-border bg-secondary px-4 py-3 text-xs">
            {error}
          </div>
        )}

        {/* LIST */}

        <CouponList
          coupons={coupons}
          claimingCode={claimingCode}
          onClaim={handleClaim}
        />
      </div>
    </main>
  );
}