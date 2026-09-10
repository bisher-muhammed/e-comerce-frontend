
import apiPrivate from "@/app/lib/api/apiPrivate";

import {
  createCouponSchema,
  updateCouponSchema,
  listCouponsSchema,
  type CreateCouponInput,
  type UpdateCouponInput,
  type ListCouponsInput,
  type CouponDiscountType,
} from "@/app/validations/admin/coupon.validation";

// ============================================================
// TYPES
// ============================================================

export interface Coupon {
  id: number;

  name: string;

  code: string;

  discountType: CouponDiscountType;

  discountValue: string | number;

  minimumOrderAmount: string | number;

  maximumDiscountAmount:
    | string
    | number
    | null;

  startsOn: string;

  expiresOn: string;

  isActive: boolean;

  _count?: {
    claims: number;
  };

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// PAGINATION
// ============================================================

export interface CouponPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================================
// FILTERS
// ============================================================

export interface CouponFilters {
  search: string | null;

  discountType:
    | CouponDiscountType
    | null;

  isActive: boolean | null;

  startDate: string | null;

  endDate: string | null;

  orderBy:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "code"
    | "startsOn"
    | "expiresOn"
    | "discountValue"
    | "minimumOrderAmount";

  order: "asc" | "desc";
}

// ============================================================
// LIST DATA
// ============================================================

export interface ListCouponsData {
  coupons: Coupon[];

  pagination: CouponPagination;

  filters: CouponFilters;
}

// ============================================================
// RESPONSES
// ============================================================

export interface CreateCouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface ListCouponsResponse {
  success: boolean;
  data: ListCouponsData;
}

export interface GetCouponResponse {
  success: boolean;
  data: Coupon;
}

export interface UpdateCouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export interface DeleteCouponResponse {
  success: boolean;
  message: string;
}

// ============================================================
// CREATE COUPON
// POST /admin/coupons
// ============================================================

export const createCoupon = async (
  data: CreateCouponInput
): Promise<CreateCouponResponse> => {
  // ----------------------------------------------------------
  // Frontend validation
  // ----------------------------------------------------------

  const parsed =
    createCouponSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid coupon data"
    );
  }

  // ----------------------------------------------------------
  // API request
  // ----------------------------------------------------------

  const response =
    await apiPrivate.post<CreateCouponResponse>(
      "/admin/coupons",
      parsed.data
    );

  return response.data;
};

// ============================================================
// LIST COUPONS
// GET /admin/coupons
// ============================================================

export const listCoupons = async (
  params?: Partial<ListCouponsInput>
): Promise<ListCouponsResponse> => {
  // ----------------------------------------------------------
  // Remove empty values
  // ----------------------------------------------------------

  const cleanParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

  // ----------------------------------------------------------
  // Frontend validation
  // ----------------------------------------------------------

  const parsed =
    listCouponsSchema.safeParse(
      cleanParams
    );

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid coupon filters"
    );
  }

  // ----------------------------------------------------------
  // API request
  // ----------------------------------------------------------

  const response =
    await apiPrivate.get<ListCouponsResponse>(
      "/admin/coupons",
      {
        params: parsed.data,
      }
    );

  return response.data;
};

// ============================================================
// GET COUPON BY ID
// GET /admin/coupons/:id
// ============================================================

export const getCouponById = async (
  id: number
): Promise<GetCouponResponse> => {
  // ----------------------------------------------------------
  // Validate ID
  // ----------------------------------------------------------

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid coupon ID"
    );
  }

  // ----------------------------------------------------------
  // API request
  // ----------------------------------------------------------

  const response =
    await apiPrivate.get<GetCouponResponse>(
      `/admin/coupons/${id}`
    );

  return response.data;
};

// ============================================================
// UPDATE COUPON
// PATCH /admin/coupons/:id
// ============================================================
//
// This handles ALL updates, including:
//
// - name
// - code
// - discountType
// - discountValue
// - minimumOrderAmount
// - maximumDiscountAmount
// - startsOn
// - expiresOn
// - isActive
//
// Therefore we do NOT need a separate /status endpoint.
// ============================================================

export const updateCoupon = async (
  id: number,
  data: UpdateCouponInput
): Promise<UpdateCouponResponse> => {
  // ----------------------------------------------------------
  // Validate ID
  // ----------------------------------------------------------

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid coupon ID"
    );
  }

  // ----------------------------------------------------------
  // Frontend validation
  // ----------------------------------------------------------

  const parsed =
    updateCouponSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid coupon data"
    );
  }

  // ----------------------------------------------------------
  // Prevent empty PATCH
  // ----------------------------------------------------------

  if (
    Object.keys(parsed.data).length === 0
  ) {
    throw new Error(
      "At least one field is required to update the coupon"
    );
  }

  // ----------------------------------------------------------
  // API request
  // ----------------------------------------------------------

  const response =
    await apiPrivate.patch<UpdateCouponResponse>(
      `/admin/coupons/${id}`,
      parsed.data
    );

  return response.data;
};

// ============================================================
// DELETE COUPON
// DELETE /admin/coupons/:id
// ============================================================

export const deleteCoupon = async (
  id: number
): Promise<DeleteCouponResponse> => {
  // ----------------------------------------------------------
  // Validate ID
  // ----------------------------------------------------------

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid coupon ID"
    );
  }

  // ----------------------------------------------------------
  // API request
  // ----------------------------------------------------------

  const response =
    await apiPrivate.delete<DeleteCouponResponse>(
      `/admin/coupons/${id}`
    );

  return response.data;
};
