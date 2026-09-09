"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import {
  type Customer,
  type CustomerPagination,
  type CustomerStatus,
} from "@/app/services/admin/user.service";

import { customerFilterSchema } from "@/app/validations/admin/user.validation";
import ConfirmDialog from "./ConfirmDialog";
import {
  initials,
  avatarColor,
  customerCode,
  formatStatusLabel,
  statusDotStyle,
  statusTextClass,
} from "./CustomerUtils";
interface CustomerListProps {
  customers: Customer[];
  pagination: CustomerPagination | null;
  onSelectCustomer: (id: number) => void;
  onSearch: (
    page?: number,
    limit?: number,
    search?: string,
    status?: CustomerStatus
  ) => Promise<void>;
  onStatusChange?: (id: number, status: CustomerStatus) => Promise<void>;
}

const STATUS_TABS: { label: string; value: CustomerStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Deactivated", value: "DEACTIVATED" },
  { label: "Pending", value: "PENDING_VERIFICATION" },
];

export default function CustomerList({
  customers,
  pagination,
  onSelectCustomer,
  onSearch,
  onStatusChange,
}: CustomerListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | undefined>(undefined);
  const [limit] = useState(10);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null);

  const runSearch = async (
    nextPage: number,
    nextStatus: CustomerStatus | undefined
  ) => {
    const result = customerFilterSchema.safeParse({
      search,
      status: nextStatus,
      page: nextPage,
      limit,
    });

    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Invalid filters"
      );
      return;
    }

    setValidationError(null);

    await onSearch(
      result.data.page,
      result.data.limit,
      result.data.search,
      result.data.status
    );
  };

  const handleTabChange = (value: CustomerStatus | undefined) => {
    setStatus(value);
    runSearch(1, value);
  };

  const handleSearchSubmit = () => runSearch(1, status);

  const handlePageChange = (newPage: number) => runSearch(newPage, status);

  // Activate: no confirmation, matches the reference screenshot
  // (only Deactivate triggers a modal there).
  const handleActivate = async (customer: Customer) => {
    if (!onStatusChange) return;
    try {
      setPendingId(customer.id);
      await onStatusChange(customer.id, "ACTIVE");
    } finally {
      setPendingId(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmTarget || !onStatusChange) return;
    try {
      setPendingId(confirmTarget.id);
      await onStatusChange(confirmTarget.id, "DEACTIVATED");
      setConfirmTarget(null);
    } finally {
      setPendingId(null);
    }
  };

  const total = pagination?.total ?? customers.length;

  const renderStatus = (customer: Customer) => (
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
  );

  const renderActions = (customer: Customer) => {
    const isPending = pendingId === customer.id;
    return (
      <>
        <button
          type="button"
          onClick={() => onSelectCustomer(customer.id)}
          className="mr-4 text-sm text-foreground hover:underline"
        >
          Edit
        </button>
        {customer.status === "DEACTIVATED" ? (
          <button
            type="button"
            disabled={!onStatusChange || isPending}
            onClick={() => handleActivate(customer)}
            className="text-sm font-medium disabled:opacity-50"
            style={{ color: "#3D8B5F" }}
          >
            {isPending ? "..." : "Activate"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!onStatusChange || isPending}
            onClick={() => setConfirmTarget(customer)}
            className="text-sm font-medium text-destructive disabled:opacity-50"
          >
            Deactivate
          </button>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            placeholder="Search name, email, ID..."
            className="h-11 w-full bg-input-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="button"
          onClick={handleSearchSubmit}
          className="h-11 shrink-0 bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>
      </div>

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        <span className="ml-auto text-sm text-muted-foreground">
          {total} customer{total === 1 ? "" : "s"}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto border border-border bg-card md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-border last:border-0 hover:bg-secondary/60"
              >
                <td
                  className="cursor-pointer px-4 py-3"
                  onClick={() => onSelectCustomer(customer.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center text-xs font-semibold ${avatarColor(
                        customer.id
                      )}`}
                    >
                      {initials(customer.firstName, customer.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {customer.firstName} {customer.lastName ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customerCode(customer.id)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-block bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                    {customer.role.charAt(0) +
                      customer.role.slice(1).toLowerCase()}
                  </span>
                </td>

                <td className="px-4 py-3">{renderStatus(customer)}</td>

                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-right">
                  {renderActions(customer)}
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="border border-border bg-card p-4"
          >
            <div
              className="flex items-start justify-between gap-3"
              onClick={() => onSelectCustomer(customer.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center text-xs font-semibold ${avatarColor(
                    customer.id
                  )}`}
                >
                  {initials(customer.firstName, customer.lastName)}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {customer.firstName} {customer.lastName ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </div>

              {renderStatus(customer)}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">
                {new Date(customer.createdAt).toLocaleDateString()}
              </span>
              <div>{renderActions(customer)}</div>
            </div>
          </div>
        ))}

        {customers.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No customers found.
          </p>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Deactivate account?"
        description={
          confirmTarget && (
            <>
              <span className="font-medium text-foreground">
                {confirmTarget.firstName} {confirmTarget.lastName ?? ""}
              </span>{" "}
              will lose access to their account and will not be able to log
              in or place orders. You can reactivate at any time.
            </>
          )
        }
        confirmLabel="Deactivate"
        loading={pendingId === confirmTarget?.id}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
