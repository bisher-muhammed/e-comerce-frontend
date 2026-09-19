import { z } from "zod";

import { CUSTOMER_STORAGE_PREFIX } from "@/app/lib/session/clientSessionData";

import {
  STEPS,
  type StepId,
} from "../components/types";

const DRAFT_KEY_PREFIX = `${CUSTOMER_STORAGE_PREFIX}checkout:draft:v2:`;

const draftKey = (cartId: number) =>
  `${DRAFT_KEY_PREFIX}${cartId}`;

const stepIdSchema = z.enum(
  STEPS.map((step) => step.id) as [
    StepId,
    ...StepId[]
  ]
);

const stepIndex = (step: StepId): number =>
  STEPS.findIndex(
    (candidate) => candidate.id === step
  );

const checkoutDraftSchema = z.object({
  currentStep: stepIdSchema,

  completedSteps: z.array(stepIdSchema),

  contact: z.object({
    email: z.string(),
    phone: z.string(),
    keepUpdated: z.boolean(),
  }),

  selectedAddressId: z
    .number()
    .int()
    .positive()
    .nullable(),

  paymentMethod: z.enum(["COD", "ONLINE"]),

  couponCode: z.string().nullable(),
});

export type CheckoutDraft = z.infer<
  typeof checkoutDraftSchema
>;

// ============================================================
// READ
// ============================================================

export const readCheckoutDraft = (
  cartId: number | null
): CheckoutDraft | null => {
  if (cartId === null) return null;

  const key = draftKey(cartId);

  try {
    const raw =
      window.sessionStorage.getItem(key);

    if (!raw) return null;

    const parsed =
      checkoutDraftSchema.safeParse(
        JSON.parse(raw)
      );

    if (!parsed.success) {
      window.sessionStorage.removeItem(key);

      return null;
    }

    return parsed.data;
  } catch {

    return null;
  }
};

// ============================================================
// WRITE
// ============================================================

export const writeCheckoutDraft = (
  cartId: number | null,
  draft: CheckoutDraft
): void => {
  if (cartId === null) return;

  try {
    window.sessionStorage.setItem(
      draftKey(cartId),
      JSON.stringify(draft)
    );
  } catch {
    // Quota or blocked storage — see readCheckoutDraft.
  }
};

// ============================================================
// CLEAR
// ============================================================

export const clearCheckoutDraft = (
  cartId: number | null
): void => {
  if (cartId === null) return;

  try {
    window.sessionStorage.removeItem(
      draftKey(cartId)
    );
  } catch {
    // See readCheckoutDraft.
  }
};

// ============================================================
// STEP RECONCILIATION
// ============================================================

export const reconcileDraftSteps = (
  draft: CheckoutDraft,
  hasAddress: boolean
): {
  currentStep: StepId;
  completedSteps: StepId[];
} => {
  if (hasAddress) {
    return {
      currentStep: draft.currentStep,
      completedSteps: draft.completedSteps,
    };
  }

  const shippingIndex = stepIndex("shipping");

  return {
    currentStep:
      stepIndex(draft.currentStep) >
      shippingIndex
        ? "shipping"
        : draft.currentStep,

    completedSteps:
      draft.completedSteps.filter(
        (step) =>
          stepIndex(step) < shippingIndex
      ),
  };
};
