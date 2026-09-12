"use client";

import { Check, CreditCard, Truck } from "lucide-react";
import type { PaymentMethod } from "./types";

interface PaymentStepProps {
  paymentMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onContinue: () => void;
}


export function PaymentStep({
  paymentMethod,
  onChange,
  onBack,
  onContinue,
}: PaymentStepProps) {
  return (
    <section>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Step 3 of 4
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Payment method
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Choose how you&apos;d like to pay.
      </p>

      <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("COD")}
          className={`relative rounded-xl border p-5 text-left transition-all ${
            paymentMethod === "COD"
              ? "border-foreground bg-secondary/40"
              : "border-border bg-background hover:border-foreground/40"
          }`}
        >
          {paymentMethod === "COD" && (
            <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
              <Check size={11} />
            </span>
          )}

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Truck size={18} />
          </div>

          <p className="mt-4 text-sm font-semibold">Cash on Delivery</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Pay in cash when your order arrives.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("ONLINE")}
          className={`relative rounded-xl border p-5 text-left transition-all ${
            paymentMethod === "ONLINE"
              ? "border-foreground bg-secondary/40"
              : "border-border bg-background hover:border-foreground/40"
          }`}
        >
          {paymentMethod === "ONLINE" && (
            <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
              <Check size={11} />
            </span>
          )}

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <CreditCard size={18} />
          </div>

          <p className="mt-4 text-sm font-semibold">Pay Online</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Card, UPI, or netbanking via Razorpay.
          </p>
        </button>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Review order
        </button>

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
        >
          Back
        </button>
      </div>
    </section>
  );
}
