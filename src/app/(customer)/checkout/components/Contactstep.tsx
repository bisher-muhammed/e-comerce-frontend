"use client";

import Link from "next/link";
import type { ContactInfo } from "./types";

interface ContactStepProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
  onContinue: () => void;
}

/**
 * NOTE: email/phone collected here are local UI state only. Nothing in
 * checkout.service or address.service accepts an email today, so this
 * doesn't persist anywhere beyond the Review step summary. Wire a real
 * field before relying on it for order confirmations.
 */
export function ContactStep({ contact, onChange, onContinue }: ContactStepProps) {
  const canContinue = contact.email.trim().length > 0;

  return (
    <section>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Step 1 of 4
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Contact information
      </h1>

      <div className="mt-8 max-w-md space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) =>
              onChange({ ...contact, email: e.target.value })
            }
            placeholder="you@email.com"
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-foreground focus:bg-background"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone number
          </label>
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) =>
              onChange({ ...contact, phone: e.target.value })
            }
            placeholder="+91 98765 43210"
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-foreground focus:bg-background"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={contact.keepUpdated}
            onChange={(e) =>
              onChange({ ...contact, keepUpdated: e.target.checked })
            }
            className="h-4 w-4 rounded border-border accent-foreground"
          />
          Keep me updated on new arrivals and exclusive offers
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to shipping
          </button>

          <Link
            href="/cart"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </section>
  );
}
