"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import SizeForm from "../components/SizeForm";
import SizeTable, {
  type Size,
} from "../components/SizeTable";
import {getApiErrorMessage} from "@/app/lib/api/apiError";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { useConfirm } from "@/app/components/feedback/ConfirmProvider";

import {
  createSize,
  deleteSize,
  getSizes,
  updateSize,
} from "@/app/services/admin/size.service";

import type { CreateSizeFormData } from "@/app/validations/admin/size.validation";

export default function SizesPage() {
  const [sizes, setSizes] = useState<Size[]>([]);

  const [editingSize, setEditingSize] =
    useState<Size | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  const loadSizes = useCallback(async () => {
  try {
    setLoading(true);

    const response = await getSizes();

    setSizes(response);
  } catch (error) {
    toast.error(
      getApiErrorMessage(
        error,
        "Failed to load sizes"
      )
    );
  } finally {
    setLoading(false);
  }
}, [toast]);

useEffect(() => {
  loadSizes();
}, [loadSizes]);


  const handleCreate = async (
  data: CreateSizeFormData
) => {
  try {
    setSaving(true);

    await createSize(data);

    setShowForm(false);

    await loadSizes();

    toast.success("Size created.");
  } catch (error) {
    toast.error(
      getApiErrorMessage(
        error,
        "Failed to create size"
      )
    );
  } finally {
    setSaving(false);
  }
};


  const handleUpdate = async (
  data: CreateSizeFormData
) => {
  if (!editingSize) return;

  try {
    setSaving(true);

    await updateSize(
      editingSize.id,
      data
    );

    setEditingSize(null);
    setShowForm(false);

    await loadSizes();

    toast.success("Size updated.");
  } catch (error) {
    toast.error(
      getApiErrorMessage(
        error,
        "Failed to update size"
      )
    );
  } finally {
    setSaving(false);
  }
};

const handleDelete = async (id: number) => {
  const confirmed = await confirm({
    title: "Delete this size?",
    description:
      "This cannot be undone.",
    confirmLabel: "Delete",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await deleteSize(id);

    await loadSizes();

    toast.success("Size deleted.");
  } catch (error) {
    toast.error(
      getApiErrorMessage(
        error,
        "Failed to delete size"
      )
    );
  }
};

  const openCreateForm = () => {
    setEditingSize(null);
    setShowForm(true);
  };

  const openEditForm = (size: Size) => {
    setEditingSize(size);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingSize(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Sizes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the sizes available for your products.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            className="flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-sm text-background"
          >
            <Plus className="h-4 w-4" />
            Add Size
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">
                {editingSize
                  ? "Edit Size"
                  : "Create Size"}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {editingSize
                  ? "Update the size information."
                  : "Add a new product size."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <SizeForm
              initialData={
                editingSize
                  ? {
                      id: editingSize.id,
                      name: editingSize.name,
                      sortOrder:
                        editingSize.sortOrder,
                    }
                  : undefined
              }
              onSubmit={
                editingSize
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={closeForm}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="border border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading sizes...
          </p>
        </div>
      ) : (
        <SizeTable
          sizes={sizes}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}