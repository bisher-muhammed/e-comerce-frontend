"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  claimCoupon,
  getAvailableCoupons,
  type CustomerCoupon,
} from "@/app/services/customer/coupon.service";

import { optionalAuthRequest } from "@/app/lib/api/apiPrivate";
import {
  getApiErrorMessage,

  getApiErrorStatus,
} from "@/app/lib/api/apiError";
import { loginPath } from "@/app/lib/auth/session";
import { useStoreData } from "@/app/components/store/StoreDataProvider";

import CouponList from "./component/CouponList";

export default function CouponsPage() {
  const { user, sessionStatus } = useStoreData();

  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);

  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [claimingCode, setClaimingCode] = useState<string | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);

  const [needsSignIn, setNeedsSignIn] = useState(false);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchCoupons = useCallback(async () => {
    try {
      setError(null);

      const data = await getAvailableCoupons(optionalAuthRequest);

      setCoupons(data);
      setNeedsSignIn(false);
    } catch (error) {
      if (getApiErrorStatus(error) === 401) {
        setNeedsSignIn(true);
      } else {
        setError(getApiErrorMessage(error, "Unable to load coupons."));
      }
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !user) return;

    let cancelled = false;

    getAvailableCoupons(optionalAuthRequest)
      .then((data) => {
        if (!cancelled) setCoupons(data);
      })
      .catch((error) => {
        if (cancelled) return;

        if (getApiErrorStatus(error) === 401) {
          setNeedsSignIn(true);
        } else {
          setError(getApiErrorMessage(error, "Unable to load coupons."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCoupons(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, user]);

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
      setError(getApiErrorMessage(error, "Unable to claim coupon."));
    } finally {
      setClaimingCode(null);
    }
  };

  if (sessionStatus === "guest" || needsSignIn) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">
            Coupons & Offers
          </h1>

          <div className="mt-8 rounded-xl border border-border bg-card px-6 py-12 text-center">
            <p className="text-sm font-medium">
              Sign in to see and claim your coupons
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Claimed coupons are saved to your account and applied at
              checkout.
            </p>

            <Link
              href={loginPath("/coupon")}
              className="mt-5 inline-flex h-10 items-center bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unavailable") {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-muted-foreground">
            Coupons couldn&apos;t be loaded right now. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const loading = sessionStatus === "loading" || loadingCoupons;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-muted-foreground">
            Loading coupons...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen px-6 py-10">
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
    </div>
  );
}