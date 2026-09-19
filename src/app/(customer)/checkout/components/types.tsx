import type { Address } from "@/app/services/customer/address.service";

export type PaymentMethod = "COD" | "ONLINE";

export type StepId = "contact" | "shipping" | "payment" | "review";

export const STEPS: { id: StepId; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export interface ContactInfo {
  email: string;
  phone: string;
  keepUpdated: boolean;
}

export interface CheckoutTotals {
  subtotal: number;
  discountAmount: number;
  total: number;
  expectedTotal: string;
  couponStale: boolean;
}

// Local-only helper so components don't need the full Address type reach-through.
export type SelectedAddress = Address | undefined;
