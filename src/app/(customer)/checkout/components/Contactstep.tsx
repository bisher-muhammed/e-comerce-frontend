
"use client";

import Link from "next/link";
import { useState } from "react";

import type { ContactInfo } from "./types";

interface ContactStepProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
  onContinue: () => void;
}

interface ContactErrors {
  email?: string;
  phone?: string;
}

export function ContactStep({
  contact,
  onChange,
  onContinue,
}: ContactStepProps) {
  const [errors, setErrors] = useState<ContactErrors>({});

  const validateContact = (): boolean => {
    const newErrors: ContactErrors = {};

    const email = contact.email.trim();
    const phone = contact.phone.trim();

    // Email validation
    if (!email) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^\+?[1-9]\d{9,14}$/.test(phone)
    ) {
      newErrors.phone = "Enter a valid phone number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateContact()) {
      return;
    }

    onContinue();
  };

  return (
    <section>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Step 1 of 4
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Contact information
      </h1>

      <div className="mt-8 max-w-md space-y-6">
        {/* EMAIL */}
        <div>
          <label
            htmlFor="checkout-email"
            className="mb-2 block text-sm font-medium"
          >
            Email address
          </label>

          <input
            id="checkout-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "checkout-email-error" : undefined
            }
            value={contact.email}
            onChange={(e) => {
              const value = e.target.value;

              onChange({
                ...contact,
                email: value,
              });

              // Clear the error while the user fixes the field
              if (errors.email) {
                setErrors((previous) => ({
                  ...previous,
                  email: undefined,
                }));
              }
            }}
            onBlur={validateContact}
            placeholder="you@email.com"
            className={`w-full rounded-lg border bg-secondary/40 px-4 py-3 text-sm outline-none focus:bg-background ${
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-foreground"
            }`}
          />

          {errors.email && (
            <p
              id="checkout-email-error"
              role="alert"
              className="mt-1 text-sm text-red-500"
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* PHONE */}
        <div>
          <label
            htmlFor="checkout-phone"
            className="mb-2 block text-sm font-medium"
          >
            Phone number
          </label>

          <input
            id="checkout-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "checkout-phone-error" : undefined
            }
            value={contact.phone}
            onChange={(e) => {
              const value = e.target.value;

              onChange({
                ...contact,
                phone: value,
              });

              // Clear the error while the user fixes the field
              if (errors.phone) {
                setErrors((previous) => ({
                  ...previous,
                  phone: undefined,
                }));
              }
            }}
            onBlur={validateContact}
            placeholder="+919876543210"
            className={`w-full rounded-lg border bg-secondary/40 px-4 py-3 text-sm outline-none focus:bg-background ${
              errors.phone
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-foreground"
            }`}
          />

          {errors.phone && (
            <p
              id="checkout-phone-error"
              role="alert"
              className="mt-1 text-sm text-red-500"
            >
              {errors.phone}
            </p>
          )}
        </div>

        {/* MARKETING */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={contact.keepUpdated}
            onChange={(e) =>
              onChange({
                ...contact,
                keepUpdated: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-border accent-foreground"
          />

          Keep me updated on new arrivals and exclusive offers
        </label>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleContinue}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
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