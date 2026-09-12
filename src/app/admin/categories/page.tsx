"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import CategoryForm from "../components/CategoryForm";
import CategoryTable, {
  type Category,
} from "../components/CategoryTable";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/app/services/admin/category.service";

import type { CreateCategoryFormData } from "@/app/validations/admin/category.validation";
import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { useConfirm } from "@/app/components/feedback/ConfirmProvider";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();


  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      setCategories(response.data);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load categories"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (
    data: CreateCategoryFormData
  ) => {
    try {
      setSaving(true);

      await createCategory(data);

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();

      toast.success("Category created.");
    } catch (error) {
      console.error(
        "Failed to create category:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to create category"
        )
      );
    } finally {
      setSaving(false);
    }
  };


  const handleUpdate = async (
    data: CreateCategoryFormData
  ) => {
    if (!editingCategory) return;

    try {
      setSaving(true);

      await updateCategory(
        editingCategory.id,
        data
      );

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();

      toast.success("Category updated.");
    } catch (error) {
      console.error(
        "Failed to update category:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update category"
        )
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Delete this category?",
      description:
        "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await deleteCategory(id);

      await loadCategories();

      toast.success("Category deleted.");
    } catch (error) {
      console.error(
        "Failed to delete category:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to delete category"
        )
      );
    }
  };


  const handleToggleStatus = async (
    category: Category
  ) => {
    try {
      await updateCategory(category.id, {
        isActive: !category.isActive,
      });

      await loadCategories();

      toast.success(
        category.isActive
          ? "Category deactivated."
          : "Category activated."
      );
    } catch (error) {
      console.error(
        "Failed to update category status:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update category status"
        )
      );
    }
  };


  const openCreateForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };


  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

 
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Categories
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage product categories for your store.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            className="flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-sm text-background"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="border border-border bg-background">
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">
                {editingCategory
                  ? "Edit Category"
                  : "Create Category"}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {editingCategory
                  ? "Update the category information."
                  : "Add a new product category."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5">
            <CategoryForm
              initialData={
                editingCategory ?? undefined
              }
              onSubmit={
                editingCategory
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={closeForm}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <div className="border border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading categories...
          </p>
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
