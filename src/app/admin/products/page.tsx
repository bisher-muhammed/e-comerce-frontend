"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import ProductGrid, { type Product } from "../components/ProductGrid";
import ProductForm from "../components/ProductForm";

import {
  getProducts,
  deleteProduct,
  updateProduct,
  type ProductPagination,
} from "@/app/services/admin/product.service";
import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { useConfirm } from "@/app/components/feedback/ConfirmProvider";

const PRODUCTS_PER_PAGE = 20;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ProductPagination | null>(
    null
  );
  const [editingProductId, setEditingProductId] = useState<number | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts({
        page,
        limit: PRODUCTS_PER_PAGE,
      });

      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? []);

      if (list.length === 0 && page > 1) {
        setPage((current) => current - 1);
        return;
      }

      setProducts(list);
      setPagination(response.data?.pagination ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load products."));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Delete this product?",
      description:
        "The product and its variants will be removed. This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await deleteProduct(id);
      await loadProducts();
      toast.success("Product deleted.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete product."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      setSaving(true);
      setError(null);
      await updateProduct(product.id, { isActive: !product.isActive });
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update product status."));
    } finally {
      setSaving(false);
    }
  };

  const openCreateForm = () => {
    setEditingProductId(null);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingProductId(null);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingProductId(null);
    await loadProducts();
  };

  return (
    <div className="w-full min-w-0 space-y-6 p-4 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Products</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage products, colors, sizes, prices, stock, and images.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            className="flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-sm text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start justify-between gap-3 border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>

          <button
            type="button"
            onClick={() => setError(null)}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-destructive hover:bg-destructive/10"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Product form */}
      {showForm && (
        <div className="border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">
                {editingProductId ? "Edit Product" : "Create Product"}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {editingProductId
                  ? "Update product information."
                  : "Create a product with colors, sizes, variants, stock, and images."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <ProductForm
              productId={editingProductId ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(240px, 100%), 1fr))",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse border border-border bg-secondary/40"
            />
          ))}
        </div>
      ) : (
        <ProductGrid
          products={products}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border border-border bg-background px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} product
            {pagination.total === 1 ? "" : "s"}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage || saving}
              onClick={() => setPage(pagination.page - 1)}
              className="border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage || saving}
              onClick={() => setPage(pagination.page + 1)}
              className="border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
