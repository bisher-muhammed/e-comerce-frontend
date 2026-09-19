"use client";

import Link from "next/link";
import { Clock, CreditCard, MapPin, Truck } from "lucide-react";
import type { Address } from "@/app/services/customer/address.service";
import type { Cart } from "@/app/services/customer/cart.service";
import type { CheckoutTotals, ContactInfo, PaymentMethod, StepId, } from "./types";

interface ReviewStepProps {
  contact: ContactInfo;
  address: Address | undefined;
  paymentMethod: PaymentMethod;
  cart: Cart;
  totals: CheckoutTotals;
  hasStockIssue: boolean;
  placing: boolean;
  actionError: string;
  pendingPayment: {
    orderId: number;
    expiresAtLabel: string | null;
  } | null;
  onEdit: (step: StepId) => void;
  onPlaceOrder: () => void;
}

export function ReviewCard({
  contact,
  address,
  paymentMethod,
  cart,
  totals,
  hasStockIssue,
  placing,
  actionError,
  pendingPayment,
  onEdit,
  onPlaceOrder,
}: ReviewStepProps) {
  return (
    <section>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Step 4 of 4
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Review your order
      </h1>

      <div className="mt-8 max-w-xl overflow-hidden rounded-xl border border-border bg-card">
        {/* CONTACT */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Contact
            </p>
            <p className="mt-2 text-sm">{contact.email || "—"}</p>
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
          </div>

          <button
            type="button"
            onClick={() => onEdit("contact")}
            className="shrink-0 text-xs font-medium underline underline-offset-4"
          >
            Edit
          </button>
        </div>

        {/* SHIPPING */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Shipping address
            </p>

            {address ? (
              <div className="mt-2 flex gap-3">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-6">
                  <span className="font-medium">
                    {address.firstName} {address.lastName}
                  </span>
                  <br />
                  {address.addressLine1}, {address.addressLine2}
                  {address.landmark ? `, ${address.landmark}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-destructive">
                No delivery address selected.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onEdit("shipping")}
            className="shrink-0 text-xs font-medium underline underline-offset-4"
          >
            Edit
          </button>
        </div>

        {/* DELIVERY */}
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div className="flex items-center gap-3 text-sm">
            <Truck size={14} />
            <span>Standard delivery (3–5 days) — Free</span>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Payment
            </p>

            <div className="mt-2 flex items-center gap-3">
              {paymentMethod === "COD" ? (
                <Truck size={14} />
              ) : (
                <CreditCard size={14} />
              )}

              <div>
                <p className="text-sm font-medium">
                  {paymentMethod === "COD" ? "Cash on Delivery" : "Pay Online"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentMethod === "COD"
                    ? "Pay when your order arrives."
                    : "Card, UPI, or netbanking via Razorpay."}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEdit("payment")}
            className="shrink-0 text-xs font-medium underline underline-offset-4"
          >
            Edit
          </button>
        </div>
      </div>

      {pendingPayment && (
        <div
          role="status"
          className="mt-6 max-w-xl rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm"
        >
          <div className="flex items-start gap-2">
            <Clock size={14} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">
                Payment not completed
              </p>

              <p className="mt-1 text-muted-foreground">
                Order #{pendingPayment.orderId} is reserved for you
                {pendingPayment.expiresAtLabel
                  ? ` until ${pendingPayment.expiresAtLabel}`
                  : ""}
                . Complete the payment to confirm it — you can also pay
                or cancel it from{" "}
                <Link
                  href={`/accounts/orders/${pendingPayment.orderId}`}
                  className="underline underline-offset-4"
                >
                  your orders
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mt-6 max-w-xl rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <div className="mt-8 flex max-w-xl items-center gap-3">
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={placing || hasStockIssue || !cart.items.length}
          className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
          )}

          {placing
            ? paymentMethod === "ONLINE" || pendingPayment
              ? "Opening payment..."
              : "Placing order..."
            : pendingPayment
            ? "Complete payment"
            : paymentMethod === "COD"
            ? "Place order"
            : `Pay ₹${totals.total.toFixed(2)}`}
        </button>

        <button
          type="button"
          onClick={() => onEdit("payment")}
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
        >
          Back
        </button>
      </div>

      {hasStockIssue && (
        <p className="mt-3 text-xs text-destructive">
          Fix the stock issue in your cart before placing your order.
        </p>
      )}
    </section>
  );
}
