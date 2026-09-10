import { z } from "zod";
// ============================================================
// ENUMS
// ============================================================

export const couponDiscountTypeSchema = z.enum([
  "PERCENTAGE",
  "FIXED",
]);

// ============================================================
// HELPERS
// ============================================================

const couponNameSchema = z
  .string()
  .trim()
  .min(2, "Coupon name must be at least 2 characters")
  .max(100, "Coupon name must not exceed 100 characters");

const couponCodeSchema = z
  .string()
  .trim()
  .min(3, "Coupon code must be at least 3 characters")
  .max(50, "Coupon code must not exceed 50 characters")
  .transform((value) =>
    value.replace(/\s+/g, "").toUpperCase()
  )
  .pipe(
    z
      .string()
      .regex(
        /^[A-Z0-9_-]+$/,
        "Coupon code can contain only letters, numbers, hyphens, and underscores"
      )
  );

const discountValueSchema = z
  .coerce
  .number()
  .positive(
    "Discount value must be greater than 0"
  )
  .finite(
    "Discount value must be a valid number"
  );

const minimumOrderAmountSchema = z
  .coerce
  .number()
  .min(
    0,
    "Minimum order amount cannot be negative"
  )
  .finite(
    "Minimum order amount must be a valid number"
  );

const maximumDiscountAmountSchema = z
  .union([
    z
      .coerce
      .number()
      .positive(
        "Maximum discount amount must be greater than 0"
      )
      .finite(
        "Maximum discount amount must be a valid number"
      ),

    z.null(),
  ])
  .optional();

// ============================================================
// CREATE COUPON
// ============================================================

export const createCouponSchema = z
  .object({
    name: couponNameSchema,

    code: couponCodeSchema,

    discountType:
      couponDiscountTypeSchema,

    discountValue:
      discountValueSchema,

    minimumOrderAmount:
      minimumOrderAmountSchema,

    maximumDiscountAmount:
      maximumDiscountAmountSchema,

    startsOn: z
      .string()
      .min(1, "Start date is required"),

    expiresOn: z
      .string()
      .min(1, "Expiry date is required"),

    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // --------------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------------

    const startDate = new Date(
      `${data.startsOn}T00:00:00`
    );

    const expiryDate = new Date(
      `${data.expiresOn}T00:00:00`
    );

    if (
      Number.isNaN(startDate.getTime())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date",
        path: ["startsOn"],
      });
    }

    if (
      Number.isNaN(expiryDate.getTime())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid expiry date",
        path: ["expiresOn"],
      });
    }

    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(expiryDate.getTime()) &&
      startDate > expiryDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Start date must be before or equal to expiry date",
        path: ["startsOn"],
      });
    }

    // --------------------------------------------------------
    // PERCENTAGE
    // --------------------------------------------------------

    if (
      data.discountType === "PERCENTAGE"
    ) {
      if (
        data.discountValue > 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Percentage discount cannot exceed 100%",
          path: ["discountValue"],
        });
      }

      if (
        data.maximumDiscountAmount !==
          undefined &&
        data.maximumDiscountAmount !==
          null &&
        data.maximumDiscountAmount <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Maximum discount amount must be greater than 0",
          path: [
            "maximumDiscountAmount",
          ],
        });
      }
    }

    // --------------------------------------------------------
    // FIXED
    // --------------------------------------------------------

    if (
      data.discountType === "FIXED" &&
      data.maximumDiscountAmount !==
        undefined &&
      data.maximumDiscountAmount !== null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Maximum discount amount can only be used with percentage coupons",
        path: [
          "maximumDiscountAmount",
        ],
      });
    }
  });

// ============================================================
// UPDATE COUPON
// ============================================================

export const updateCouponSchema = z
  .object({
    name:
      couponNameSchema.optional(),

    code:
      couponCodeSchema.optional(),

    discountType:
      couponDiscountTypeSchema.optional(),

    discountValue:
      discountValueSchema.optional(),

    minimumOrderAmount:
      minimumOrderAmountSchema.optional(),

    maximumDiscountAmount:
      maximumDiscountAmountSchema,

    startsOn:
      z.string().optional(),

    expiresOn:
      z.string().optional(),

    isActive:
      z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // --------------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------------

    if (
      data.startsOn !== undefined &&
      data.expiresOn !== undefined
    ) {
      const startDate = new Date(
        `${data.startsOn}T00:00:00`
      );

      const expiryDate = new Date(
        `${data.expiresOn}T00:00:00`
      );

      if (
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(expiryDate.getTime()) &&
        startDate > expiryDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Start date must be before or equal to expiry date",
          path: ["startsOn"],
        });
      }
    }

    // --------------------------------------------------------
    // PERCENTAGE
    // --------------------------------------------------------

    if (
      data.discountType ===
        "PERCENTAGE" &&
      data.discountValue !== undefined &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Percentage discount cannot exceed 100%",
        path: ["discountValue"],
      });
    }

    // --------------------------------------------------------
    // FIXED
    // --------------------------------------------------------

    if (
      data.discountType === "FIXED" &&
      data.maximumDiscountAmount !==
        undefined &&
      data.maximumDiscountAmount !== null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Maximum discount amount can only be used with percentage coupons",
        path: [
          "maximumDiscountAmount",
        ],
      });
    }
  });

// ============================================================
// UPDATE STATUS
// ============================================================

export const updateCouponStatusSchema =
  z.object({
    isActive: z.boolean(),
  });

// ============================================================
// LIST COUPONS
// ============================================================

export const listCouponsSchema = z
  .object({
    page: z
      .coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),

    search: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    discountType:
      couponDiscountTypeSchema.optional(),

    isActive: z
      .enum(["true", "false"])
      .transform(
        (value) => value === "true"
      )
      .optional(),

    startDate:
      z.string().optional(),

    endDate:
      z.string().optional(),

    orderBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "code",
        "startsOn",
        "expiresOn",
        "discountValue",
        "minimumOrderAmount",
      ])
      .default("createdAt"),

    order: z
      .enum(["asc", "desc"])
      .default("desc"),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      data.startDate <= data.endDate,
    {
      message:
        "startDate must be before or equal to endDate",
      path: ["startDate"],
    }
  );

// ============================================================
// TYPES
// ============================================================

export type CouponDiscountType =
  z.infer<
    typeof couponDiscountTypeSchema
  >;

export type CreateCouponInput =
  z.infer<
    typeof createCouponSchema
  >;

export type UpdateCouponInput =
  z.infer<
    typeof updateCouponSchema
  >;

export type UpdateCouponStatusInput =
  z.infer<
    typeof updateCouponStatusSchema
  >;

export type ListCouponsInput =
  z.infer<
    typeof listCouponsSchema
  >;
