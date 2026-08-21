"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import apiPrivate from "@/app/lib/api/apiPrivate";
import AdminTable from "../components/AdminTable"
import AdminForm from "../components/AdminForm";

export interface Admin {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  role: "ADMIN" | "SUPER_ADMIN";
  status:
    | "PENDING_VERIFICATION"
    | "ACTIVE"
    | "SUSPENDED"
    | "DEACTIVATED";
  createdAt: string;
  updatedAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async (refresh = false) => {
    try {
      setError(null);

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await apiPrivate.get("/admin/admins");

      setAdmins(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch admins:", error);

      const message =
        error.response?.data?.message ||
        "Unable to load administrators.";

      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdminCreated = () => {
    setShowForm(false);
    fetchAdmins(true);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}

      <div
        className="
          border-b
          border-border
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h1 className="text-2xl font-medium tracking-tight">
              Administrators
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage administrators who have access to the
              admin portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAdmins(true)}
              disabled={isRefreshing}
              aria-label="Refresh administrators"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                border
                border-border
                text-muted-foreground
                transition-colors
                hover:bg-secondary
                hover:text-foreground
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="
                flex
                h-10
                items-center
                gap-2
                bg-primary
                px-4
                text-sm
                font-medium
                text-primary-foreground
                transition-opacity
                hover:opacity-90
              "
            >
              <Plus className="h-4 w-4" />

              <span>Add Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}

      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        {/* Error */}

        {error && (
          <div
            className="
              mb-5
              border
              border-destructive/20
              bg-destructive/5
              px-4
              py-3
              text-sm
              text-destructive
            "
          >
            {error}
          </div>
        )}

        {/* Table */}

        <AdminTable
          admins={admins}
          isLoading={isLoading}
        />
      </div>

      {/* Create Admin Modal */}

      {showForm && (
        <AdminForm
          onClose={() => setShowForm(false)}
          onSuccess={handleAdminCreated}
        />
      )}
    </div>
  );
}