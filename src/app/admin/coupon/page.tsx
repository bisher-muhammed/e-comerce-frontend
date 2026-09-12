"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  listCoupons,
  updateCoupon,
  type Coupon,
  type ListCouponsData,
} from "@/app/services/admin/coupon.service";

import type {
  CreateCouponInput,
  UpdateCouponInput,
  ListCouponsInput,
} from "@/app/validations/admin/coupon.validation";

import CouponList from "./components/CouponList";
import CouponForm from "./components/CouponForm";
import CouponDetails from "./components/CouponDetails";

import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { useConfirm } from "@/app/components/feedback/ConfirmProvider";

export default function CouponsPage() {
  // ============================================================
  // DATA
  // ============================================================

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [pagination, setPagination] =
    useState<ListCouponsData["pagination"]>({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // ============================================================
  // FILTERS
  // ============================================================

  const [filters, setFilters] =
    useState<ListCouponsInput>({
      page: 1,
      limit: 10,
      orderBy: "createdAt",
      order: "desc",
    });

  // ============================================================
  // UI STATE
  // ============================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [selectedCoupon, setSelectedCoupon] =
    useState<Coupon | null>(null);

  const [editingCoupon, setEditingCoupon] =
    useState<Coupon | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  // Used for actions such as activate/deactivate/delete
  const [actionLoading, setActionLoading] =
    useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  // ============================================================
  // FETCH COUPONS
  // ============================================================

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await listCoupons(filters);

      setCoupons(response.data.coupons);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleFilterChange = (
    nextFilters: Partial<ListCouponsInput>
  ) => {
    setFilters((current) => ({
      ...current,
      ...nextFilters,
      page: 1,
    }));
  };

  // ============================================================
  // TOGGLE STATUS
  // ============================================================

  const handleToggleStatus = async (
    coupon: Coupon
  ) => {
    try {
      setActionLoading(true);
      setError(null);

      await updateCoupon(coupon.id, {
        isActive: !coupon.isActive,
      });

      await fetchCoupons();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // PAGE CHANGE
  // ============================================================

  const handlePageChange = (page: number) => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  };

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowForm(true);
    setError(null);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
    setError(null);
  };

  // ============================================================
  // VIEW
  // ============================================================

  const handleView = async (
    coupon: Coupon
  ) => {
    try {
      setError(null);

      const response =
        await getCouponById(coupon.id);

      setSelectedCoupon(response.data);
      setShowDetails(true);
    } catch (error) {
      setError(getApiErrorMessage(error));
    }
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (
    data:
      | CreateCouponInput
      | UpdateCouponInput
  ) => {
    try {
      setSubmitting(true);
      setError(null);

      if (editingCoupon) {
        await updateCoupon(
          editingCoupon.id,
          data as UpdateCouponInput
        );
      } else {
        await createCoupon(
          data as CreateCouponInput
        );
      }

      setShowForm(false);
      setEditingCoupon(null);

      await fetchCoupons();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    coupon: Coupon
  ) => {
    const claims =
      coupon._count?.claims ?? 0;

    /*
     * The API rejects deleting a claimed coupon, so there is no
     * point asking the user to confirm one.
     */
    if (claims > 0) {
      toast.error(
        `"${coupon.code}" has ${claims} claim(s) and cannot be deleted. Deactivate it instead.`
      );

      return;
    }

    const confirmed = await confirm({
      title: `Delete coupon "${coupon.code}"?`,
      description:
        "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      await deleteCoupon(coupon.id);

      if (
        selectedCoupon?.id === coupon.id
      ) {
        setSelectedCoupon(null);
        setShowDetails(false);
      }

      await fetchCoupons();

      toast.success(
        `Coupon "${coupon.code}" deleted.`
      );
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);
    setEditingCoupon(null);
  };

  // ============================================================
  // CLOSE DETAILS
  // ============================================================

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCoupon(null);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Coupons
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Manage discount coupons and their validity.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting || actionLoading}
            className="flex items-center gap-2 rounded-none bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Create coupon
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-none border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-4 py-3 text-sm text-[var(--destructive)]">
            {error}
          </div>
        )}

        {/* ======================================================
            LIST
        ====================================================== */}

        <CouponList
          coupons={coupons}
          pagination={pagination}
          filters={filters}
          loading={loading || actionLoading}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>

      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showForm && (
        <CouponForm
          coupon={editingCoupon}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* ========================================================
          DETAILS MODAL
      ======================================================== */}

      {showDetails && selectedCoupon && (
        <CouponDetails
          coupon={selectedCoupon}
          onClose={handleCloseDetails}
          onEdit={() => {
            setShowDetails(false);
            handleEdit(selectedCoupon);
          }}
        />
      )}
    </main>
  );
}
