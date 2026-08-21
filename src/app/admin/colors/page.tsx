"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import ColorForm from "../components/ColorForm";
import ColorTable, {
  type Color,
} from "../components/ColorTable";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

import {
  createColor,
  deleteColor,
  getColors,
  updateColor,
} from "@/app/services/admin/color.service";

import type { CreateColorFormData } from "@/app/validations/admin/color.validation";

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);

  const [editingColor, setEditingColor] =
    useState<Color | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const loadColors = async () => {
    try {
      setLoading(true);

      const response = await getColors();

      setColors(response);
    } catch (error) {
      const message = getApiErrorMessage(error);

      console.error(
        "Failed to load colors:",
        message
      );

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const handleCreate = async (
    data: CreateColorFormData
  ) => {
    try {
      setSaving(true);

      await createColor(data);

      setShowForm(false);
      setEditingColor(null);

      await loadColors();
    } catch (error) {
      const message = getApiErrorMessage(error);

      console.error(
        "Failed to create color:",
        message
      );

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    data: CreateColorFormData
  ) => {
    if (!editingColor) return;

    try {
      setSaving(true);

      await updateColor(
        editingColor.id,
        data
      );

      setEditingColor(null);
      setShowForm(false);

      await loadColors();
    } catch (error) {
      const message = getApiErrorMessage(error);

      console.error(
        "Failed to update color:",
        message
      );

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this color?"
    );

    if (!confirmed) return;

    try {
      await deleteColor(id);

      await loadColors();
    } catch (error) {
      const message = getApiErrorMessage(error);

      console.error(
        "Failed to delete color:",
        message
      );

      alert(message);
    }
  };

  const openCreateForm = () => {
    setEditingColor(null);
    setShowForm(true);
  };

  const openEditForm = (color: Color) => {
    setEditingColor(color);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingColor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Colors
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the colors available for your products.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            className="flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-sm text-background"
          >
            <Plus className="h-4 w-4" />
            Add Color
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">
                {editingColor
                  ? "Edit Color"
                  : "Create Color"}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {editingColor
                  ? "Update the color information."
                  : "Add a new product color."}
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
            <ColorForm
              initialData={
                editingColor
                  ? {
                      id: editingColor.id,
                      name: editingColor.name,
                      slug: editingColor.slug,
                      hexCode:
                        editingColor.hexCode ??
                        undefined,
                    }
                  : undefined
              }
              onSubmit={
                editingColor
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
            Loading colors...
          </p>
        </div>
      ) : (
        <ColorTable
          colors={colors}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
