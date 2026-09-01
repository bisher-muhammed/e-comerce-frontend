"use client";

import type { Address } from "@/app/services/customer/address.service";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  loading?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  loading = false,
}: AddressCardProps) {
  // `label` (Home / Office / Other) is NOT part of the Address type you gave
  // me. This falls back to a generic tag until that field actually exists
  // on the model — add it to the schema, don't just trust this fallback.
  const typeLabel = (address.label ?? "Address").toUpperCase();

  return (
    <article className="border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="border border-border px-2.5 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            {typeLabel}
          </span>

          {address.isDefault && (
            <span className="bg-foreground px-2.5 py-1 text-xs font-medium tracking-wide text-background">
              DEFAULT
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => onEdit(address)}
            disabled={loading}
            className="text-foreground underline-offset-2 hover:underline disabled:opacity-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            disabled={loading}
            className="text-muted-foreground underline-offset-2 hover:text-destructive hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm">
        <p className="font-medium text-foreground">
          {address.firstName} {address.lastName}
        </p>

        <div className="mt-1 space-y-0.5 text-muted-foreground">
          <p>{address.addressLine1}</p>

          {address.addressLine2 && <p>{address.addressLine2}</p>}

          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>

          <p>{address.country}</p>
        </div>

        <p className="mt-3 text-muted-foreground">{address.phone}</p>
      </div>

      {/* Screenshot uses a checkbox here, but a checkbox implies a state you
          can toggle off, which isn't true for "default" — you can only make
          a DIFFERENT address default. Kept as-is to match the reference. */}
      {!address.isDefault && (
        <label className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={false}
            onChange={() => onSetDefault(address.id)}
            disabled={loading}
            className="h-4 w-4 border-border accent-foreground disabled:opacity-50"
          />
          {loading ? "Updating..." : "Set as default"}
        </label>
      )}
    </article>
  );
}''