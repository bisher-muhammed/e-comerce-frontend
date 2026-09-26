import type { AxiosRequestConfig } from "axios";

import apiPrivate from "@/app/lib/api/apiPrivate";
import { UserFacingError } from "@/app/lib/api/errors";

import {
  couponCodeSchema,
  type ValidateCouponInput,
} from "@/app/validations/customer/coupon.validation";



export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export interface CouponClaim {
  id: number;
  claimedAt: string;
  usedAt: string | null;
}

export interface CustomerCoupon {
  id: number;
  name: string;
  code: string;

  discountType: CouponDiscountType;

  discountValue: string | number;

  minimumOrderAmount: string | number;

  maximumDiscountAmount: string | number | null;

  startsOn: string;
  expiresOn: string;

  isActive: boolean;

  isClaimed: boolean;

  claim: CouponClaim | null;
}

export interface CouponValidationResult {
  coupon: {
    id: number;
    name: string;
    code: string;

    discountType: CouponDiscountType;

    discountValue: string | number;

    minimumOrderAmount: string | number;

    maximumDiscountAmount: string | number | null;

    startsOn: string;
    expiresOn: string;
  };

  subtotal: number;
  discountAmount: number;
  finalSubtotal: number;
}

export interface CouponClaimResult {
  id: number;
  claimedAt: string;

  coupon: CouponValidationResult["coupon"];
}

interface GetCouponsResponse {
  success: boolean;


  data: CustomerCoupon[];
}

interface ValidateCouponResponse {
  success: boolean;
  data: CouponValidationResult;
}

interface ClaimCouponResponse {
  success: boolean;
  message: string;
  data: CouponClaimResult;
}

const COUPON_API_PATH = "/customer/coupons";



// ============================================================
// HELPERS
// ============================================================

const toAmount = (value: unknown): number => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
};

// ============================================================
// GET AVAILABLE COUPONS
// GET /api/v1/customer/coupons
// ============================================================

export const getAvailableCoupons = async (
  options?: AxiosRequestConfig
): Promise<CustomerCoupon[]> => {
  const response =
    await apiPrivate.get<GetCouponsResponse>(
      COUPON_API_PATH,
      options
    );

  return response.data.data;
};

// ============================================================
// VALIDATE COUPON
// GET /api/v1/customer/coupons/:code?subtotal=...
// ============================================================

export const validateCoupon = async (
  input: ValidateCouponInput
): Promise<CouponValidationResult> => {
  const parsed = couponCodeSchema.safeParse(input.code);

  if (!parsed.success) {
    throw new UserFacingError(parsed.error.issues[0].message);
  }

  const code = parsed.data;

  const response =
    await apiPrivate.get<ValidateCouponResponse>(
      `${COUPON_API_PATH}/${encodeURIComponent(code)}`,
      {
        params: {
          subtotal: input.subtotal,
        },
      }
    );

  const result = response.data.data;

  return {
    ...result,
    subtotal: toAmount(result.subtotal),
    discountAmount: toAmount(result.discountAmount),
    finalSubtotal: toAmount(result.finalSubtotal),
  };
};

// ============================================================
// CLAIM COUPON
// POST /api/v1/customer/coupons/:code/claim
// ============================================================

export const claimCoupon = async (
  code: string
): Promise<CouponClaimResult> => {
  const parsed = couponCodeSchema.safeParse(code);

  if (!parsed.success) {
    throw new UserFacingError(parsed.error.issues[0].message);
  }

  const normalizedCode = parsed.data;

  const response =
    await apiPrivate.post<ClaimCouponResponse>(
      `${COUPON_API_PATH}/${encodeURIComponent(
        normalizedCode
      )}/claim`,
      {}
    );

  return response.data.data;
};
