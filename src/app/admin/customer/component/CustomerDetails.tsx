"use client";

import { useState } from "react";

import type { Customer, CustomerStatus } from "@/app/services/admin/user.service";
import ConfirmDialog from "./ConfirmDialog";
import {
  initials,
  avatarColor,
  customerCode,
  formatStatusLabel,
  statusDotStyle,
  statusTextClass,
} from "./CustomerUtils";

interface CustomerDetailsProps {
  customer: Customer;
  onStatusChange?: (id: number, status: CustomerStatus) => Promise<void>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export default function CustomerDetails({
  customer,
  onStatusChange,
}: CustomerDetailsProps) {
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleActivate = async () => {
    if (!onStatusChange) return;
    try {
      setPending(true);
      await onStatusChange(customer.id, "ACTIVE");
    } finally {
      setPending(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!onStatusChange) return;
    try {
      setPending(true);
      await onStatusChange(customer.id, "DEACTIVATED");
      setConfirmOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="border border-border bg-card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center text-sm font-semibold ${avatarColor(
              customer.id
            )}`}
          >
            {initials(customer.firstName, customer.lastName)}
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {customer.firstName} {customer.lastName ?? ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              {customerCode(customer.id)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center gap-2 text-sm ${statusTextClass(
              customer.status
            )}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={statusDotStyle(customer.status)}
            />
            {formatStatusLabel(customer.status)}
          </span>

          {onStatusChange &&
            (customer.status === "DEACTIVATED" ? (
              <button
                type="button"
                disabled={pending}
                onClick={handleActivate}
                className="border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ color: "#3D8B5F" }}
              >
                {pending ? "..." : "Activate"}
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmOpen(true)}
                className="border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
              >
                Deactivate
              </button>
            ))}
        </div>
      </div>

      <div className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
        <Field label="First name" value={customer.firstName} />
        <Field label="Last name" value={customer.lastName ?? "—"} />
        <Field label="Email" value={customer.email} />
        <Field
          label="Role"
          value={customer.role.charAt(0) + customer.role.slice(1).toLowerCase()}
        />
        <Field
          label="Created"
          value={new Date(customer.createdAt).toLocaleDateString()}
        />
        <Field
          label="Updated"
          value={new Date(customer.updatedAt).toLocaleDateString()}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate account?"
        description={
          <>
            <span className="font-medium text-foreground">
              {customer.firstName} {customer.lastName ?? ""}
            </span>{" "}
            will lose access to their account and will not be able to log in
            or place orders. You can reactivate at any time.
          </>
        }
        confirmLabel="Deactivate"
        loading={pending}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}

