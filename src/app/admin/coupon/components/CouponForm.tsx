"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Coupon } from "@/app/services/admin/coupon.service";

import {
  createCouponSchema,
  updateCouponSchema,
  type CreateCouponInput,
  type UpdateCouponInput,
} from "@/app/validations/admin/coupon.validation";

type Props = {
  coupon: Coupon | null;
  submitting: boolean;

  onSubmit: (
    data:
      | CreateCouponInput
      | UpdateCouponInput
  ) => Promise<void>;

  onClose: () => void;
};

type FormState = {
  name: string;
  code: string;
  discountType:
    | "PERCENTAGE"
    | "FIXED";
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscountAmount: string;
  startsOn: string;
  expiresOn: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumOrderAmount: "0",
  maximumDiscountAmount: "",
  startsOn: "",
  expiresOn: "",
  isActive: true,
};

export default function CouponForm({
  coupon,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const isEditing =
    coupon !== null;

  const [form, setForm] =
    useState<FormState>(
      emptyForm
    );

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // ESCAPE TO CLOSE
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  // ============================================================
  // INITIALIZE
  // ============================================================

  useEffect(() => {
    if (!coupon) {
      setForm({
        ...emptyForm,
      });

      return;
    }

    setForm({
      name: coupon.name,
      code: coupon.code,
      discountType:
        coupon.discountType,

      discountValue: String(
        coupon.discountValue
      ),

      minimumOrderAmount: String(
        coupon.minimumOrderAmount
      ),

      maximumDiscountAmount:
        coupon.maximumDiscountAmount ===
          null ||
        coupon.maximumDiscountAmount ===
          undefined
          ? ""
          : String(
              coupon.maximumDiscountAmount
            ),

      startsOn:
        coupon.startsOn.slice(0, 10),

      expiresOn:
        coupon.expiresOn.slice(0, 10),

      isActive:
        coupon.isActive,
    });

    setError(null);
  }, [coupon]);

  // ============================================================
  // FIELD UPDATE
  // ============================================================

  const updateField = <
    K extends keyof FormState
  >(
    field: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
  };

  // ============================================================
  // DISCOUNT TYPE CHANGE
  // Fixed-amount coupons have no "maximum discount" concept.
  // Clear the field so a stale percentage-mode value can never
  // be carried into a fixed-amount submission.
  // ============================================================

  const handleDiscountTypeChange = (
    value: "PERCENTAGE" | "FIXED"
  ) => {
    setForm((current) => ({
      ...current,
      discountType: value,
      maximumDiscountAmount:
        value === "FIXED"
          ? ""
          : current.maximumDiscountAmount,
    }));

    setError(null);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    const payload = {
      name: form.name,
      code: form.code,

      discountType:
        form.discountType,

      discountValue:
        Number(form.discountValue),

      minimumOrderAmount:
        Number(
          form.minimumOrderAmount || 0
        ),

      // FIXED coupons never carry a maximum discount, regardless
      // of what is left over in the field.
      maximumDiscountAmount:
        form.discountType === "FIXED" ||
        form.maximumDiscountAmount === ""
          ? null
          : Number(
              form.maximumDiscountAmount
            ),

      startsOn:
        form.startsOn,

      expiresOn:
        form.expiresOn,

      isActive:
        form.isActive,
    };

    // ==========================================================
    // UPDATE
    // ==========================================================

    if (isEditing) {
      const parsed =
        updateCouponSchema.safeParse(
          payload
        );

      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ??
            "Invalid coupon data"
        );

        return;
      }

      await onSubmit(parsed.data);

      return;
    }

    // ==========================================================
    // CREATE
    // ==========================================================

    const parsed =
      createCouponSchema.safeParse(
        payload
      );

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Invalid coupon data"
      );

      return;
    }

    await onSubmit(parsed.data);
  };

  // ============================================================
  // LIVE SUMMARY
  // ============================================================

  const summary = (() => {
    const value = Number(form.discountValue);

    if (!form.discountValue || Number.isNaN(value) || value <= 0) {
      return null;
    }

    const amount =
      form.discountType === "PERCENTAGE"
        ? `${value}% off`
        : `₹${value.toFixed(2)} off`;

    const cap =
      form.discountType === "PERCENTAGE" &&
      form.maximumDiscountAmount !== ""
        ? `, capped at ₹${Number(
            form.maximumDiscountAmount
          ).toFixed(2)}`
        : "";

    const min =
      Number(form.minimumOrderAmount || 0) > 0
        ? ` on orders over ₹${Number(
            form.minimumOrderAmount
          ).toFixed(2)}`
        : " on any order";

    return `${amount}${cap}${min}.`;
  })();

  // ============================================================
  // STYLES
  // ============================================================

  const inputClass =
    "w-full rounded-none border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50";

  const fieldLabel =
    "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >

      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-none border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {isEditing
                ? "Edit coupon"
                : "Create coupon"}
            </h2>

            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {isEditing
                ? "Update the coupon details."
                : "Create a new discount coupon."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-none p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* ERROR */}
          {error && (
            <div className="rounded-none border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-4 py-3 text-sm text-[var(--destructive)]">
              {error}
            </div>
          )}

          {/* NAME */}
          <div>
            <label className={fieldLabel}>
              Coupon name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Summer Sale"
              disabled={submitting}
              className={inputClass}
            />
          </div>

          {/* CODE */}
          <div>
            <label className={fieldLabel}>
              Coupon code
            </label>

            <input
              type="text"
              value={form.code}
              onChange={(event) =>
                updateField(
                  "code",
                  event.target.value.toUpperCase()
                )
              }
              placeholder="SUMMER50"
              disabled={submitting}
              className={`${inputClass} font-mono uppercase`}
            />

            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Spaces are removed and the code is
              normalized before being sent.
            </p>
          </div>

          {/* TYPE + VALUE */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className={fieldLabel}>
                Discount type
              </label>

              <select
                value={
                  form.discountType
                }
                onChange={(event) =>
                  handleDiscountTypeChange(
                    event.target.value as
                      | "PERCENTAGE"
                      | "FIXED"
                  )
                }
                disabled={submitting}
                className={inputClass}
              >
                <option value="PERCENTAGE">
                  Percentage
                </option>

                <option value="FIXED">
                  Fixed amount
                </option>
              </select>
            </div>

            <div>
              <label className={fieldLabel}>
                Discount value
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.discountValue
                }
                onChange={(event) =>
                  updateField(
                    "discountValue",
                    event.target.value
                  )
                }
                placeholder={
                  form.discountType ===
                  "PERCENTAGE"
                    ? "50"
                    : "500"
                }
                disabled={submitting}
                className={inputClass}
              />
            </div>
          </div>

          {/* MINIMUM + MAXIMUM */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className={fieldLabel}>
                Minimum order amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.minimumOrderAmount
                }
                onChange={(event) =>
                  updateField(
                    "minimumOrderAmount",
                    event.target.value
                  )
                }
                placeholder="0"
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label className={fieldLabel}>
                Maximum discount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.maximumDiscountAmount
                }
                onChange={(event) =>
                  updateField(
                    "maximumDiscountAmount",
                    event.target.value
                  )
                }
                disabled={
                  submitting ||
                  form.discountType ===
                    "FIXED"
                }
                placeholder={
                  form.discountType ===
                  "FIXED"
                    ? "Not applicable"
                    : "1000"
                }
                className={inputClass}
              />

              {form.discountType ===
                "PERCENTAGE" && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Optional maximum amount that can
                  be discounted.
                </p>
              )}
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className={fieldLabel}>
                Starts on
              </label>

              <input
                type="date"
                value={
                  form.startsOn
                }
                onChange={(event) =>
                  updateField(
                    "startsOn",
                    event.target.value
                  )
                }
                disabled={submitting}
                className={inputClass}
              />
            </div>

            <div>
              <label className={fieldLabel}>
                Expires on
              </label>

              <input
                type="date"
                value={
                  form.expiresOn
                }
                onChange={(event) =>
                  updateField(
                    "expiresOn",
                    event.target.value
                  )
                }
                disabled={submitting}
                className={inputClass}
              />

              {form.startsOn &&
                form.expiresOn &&
                form.expiresOn < form.startsOn && (
                  <p className="mt-1 text-xs text-[var(--destructive)]">
                    Expiry date is before the start date.
                  </p>
                )}
            </div>
          </div>

          {/* LIVE SUMMARY */}
          {summary && (
            <div className="border border-[var(--border)] bg-[var(--secondary)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Preview
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]">
                {summary}
              </p>
            </div>
          )}

          {/* ACTIVE */}
          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">

            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(event) =>
                updateField(
                  "isActive",
                  event.target.checked
                )
              }
              disabled={submitting}
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
            />

            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Active coupon
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                The coupon can be claimed when it is active
                and within its validity period.
              </p>
            </div>
          </label>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-none border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--secondary)] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-none bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update coupon"
                  : "Create coupon"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
