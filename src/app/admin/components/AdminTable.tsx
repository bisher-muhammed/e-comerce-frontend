"use client";

import { Admin } from "../admins/page";

interface AdminTableProps {
  admins: Admin[];
  isLoading: boolean;
}

const getInitials = (
  firstName: string,
  lastName: string | null
) => {
  const first = firstName.charAt(0);

  const last = lastName
    ? lastName.charAt(0)
    : "";

  return `${first}${last}`.toUpperCase();
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function AdminTable({
  admins,
  isLoading,
}: AdminTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border">
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex h-16 items-center px-4 sm:px-6"
            >
              <div className="h-8 w-8 animate-pulse bg-secondary" />

              <div className="ml-3 space-y-2">
                <div className="h-3 w-32 animate-pulse bg-secondary" />
                <div className="h-3 w-48 animate-pulse bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div
        className="
          border
          border-border
          px-6
          py-16
          text-center
        "
      >
        <h2 className="text-sm font-medium">
          No administrators
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create an administrator to give someone access
          to the admin portal.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}

      <div className="hidden overflow-hidden border border-border md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th
                className="
                  px-6
                  py-3
                  text-left
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Administrator
              </th>

              <th
                className="
                  px-6
                  py-3
                  text-left
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Role
              </th>

              <th
                className="
                  px-6
                  py-3
                  text-left
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Status
              </th>

              <th
                className="
                  px-6
                  py-3
                  text-left
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Created
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {admins.map((admin) => (
              <tr
                key={admin.id}
                className="transition-colors hover:bg-secondary/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        bg-secondary
                        text-xs
                        font-medium
                      "
                    >
                      {getInitials(
                        admin.firstName,
                        admin.lastName
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {admin.firstName}{" "}
                        {admin.lastName || ""}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm">
                    {admin.role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : "Admin"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={admin.status} />
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(admin.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}

      <div className="space-y-3 md:hidden">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="
              border
              border-border
              p-4
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  bg-secondary
                  text-xs
                  font-medium
                "
              >
                {getInitials(
                  admin.firstName,
                  admin.lastName
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {admin.firstName}{" "}
                  {admin.lastName || ""}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {admin.email}
                </p>
              </div>

              <StatusBadge status={admin.status} />
            </div>

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
                border-t
                border-border
                pt-3
              "
            >
              <span className="text-xs text-muted-foreground">
                {admin.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : "Admin"}
              </span>

              <span className="text-xs text-muted-foreground">
                {formatDate(admin.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatusBadge({
  status,
}: {
  status: Admin["status"];
}) {
  const label =
    status === "PENDING_VERIFICATION"
      ? "Pending"
      : status.charAt(0) +
        status.slice(1).toLowerCase();

  return (
    <span
      className="
        inline-flex
        items-center
        px-2
        py-1
        text-xs
        font-medium
        bg-secondary
        text-foreground
      "
    >
      <span
        className={`
          mr-1.5
          h-1.5
          w-1.5
          rounded-full
          ${
            status === "ACTIVE"
              ? "bg-foreground"
              : "bg-muted-foreground"
          }
        `}
      />

      {label}
    </span>
  );
}