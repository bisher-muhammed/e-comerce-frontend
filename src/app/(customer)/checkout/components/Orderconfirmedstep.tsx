"use client";

import { Check } from "lucide-react";

interface OrderConfirmedStepProps {
  customerName: string;
  orderId: string | number;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
}


export function OrderConfirmedStep({
  customerName,
  orderId,
  onTrackOrder,
  onContinueShopping,
}: OrderConfirmedStepProps) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
        <Check size={26} />
      </div>

      <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">
        Order confirmed
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Thank you, {customerName}.
      </h1>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Your order #{orderId} has been placed. You can follow its status
        from your orders page.
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        Estimated delivery: 3–5 business days
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onTrackOrder}
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Track order
        </button>

        <button
          type="button"
          onClick={onContinueShopping}
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
        >
          Continue shopping
        </button>
      </div>
    </div>
  );
}
