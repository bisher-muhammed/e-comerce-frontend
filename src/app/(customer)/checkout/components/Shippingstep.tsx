"use client";

import Link from "next/link";
import { Check, MapPin, Truck } from "lucide-react";
import type { Address } from "@/app/services/customer/address.service";

interface ShippingStepProps {
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (id: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * The reference screenshot implies free-text address entry, but this app
 * only exposes getAddresses() (read) — there's no create/update endpoint in
 * address.service to save a new one from here. So this stays "pick a saved
 * address," restyled to match, with a link out to manage/add addresses.
 */
export function ShippingStep({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onBack,
  onContinue,
}: ShippingStepProps) {
  return (
    <section>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Step 2 of 4
      </p>

      <div className="mt-2 flex items-end justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Shipping address
        </h1>

        <Link
          href="/accounts/address"
          className="text-xs font-medium underline underline-offset-4"
        >
          Manage addresses
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
          <MapPin size={22} className="mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No delivery address</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add an address to continue.
          </p>
          <Link
            href="/accounts/address"
            className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium text-background"
          >
            Add address
          </Link>
        </div>
      ) : (
        <div className="mt-8 max-w-xl space-y-3">
          {addresses.map((address) => {
            const selected = address.id === selectedAddressId;

            return (
              <button
                type="button"
                key={address.id}
                onClick={() => onSelectAddress(address.id)}
                className={`w-full rounded-lg border px-5 py-4 text-left transition-colors ${
                  selected
                    ? "border-foreground bg-secondary/40"
                    : "border-border bg-background hover:border-foreground/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {address.firstName} {address.lastName}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ""},{" "}
                        {address.city} {address.postalCode}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {address.isDefault
                        ? "Saved address (Default)"
                        : "Saved address"}
                    </p>
                  </div>

                  {selected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                      <Check size={11} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="rounded-lg border border-border px-5 py-4">
            <div className="flex items-center gap-3 text-sm">
              <Truck size={16} />
              <div>
                <p className="font-medium">Standard delivery</p>
                <p className="text-xs text-muted-foreground">
                  3–5 business days · Free
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          disabled={!selectedAddressId}
          onClick={onContinue}
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to payment
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
