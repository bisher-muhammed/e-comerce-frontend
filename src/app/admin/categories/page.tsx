"use client";

import { useEffect, useState } from "react";
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      setCategories(response.data);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (
    data: CreateCategoryFormData
  ) => {
    try {
      setSaving(true);

      await createCategory(data);

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();
    } catch (error) {
      console.error(
        "Failed to create category:",
        error
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
    } catch (error) {
      console.error(
        "Failed to update category:",
        error
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await deleteCategory(id);

      await loadCategories();
    } catch (error) {
      console.error(
        "Failed to delete category:",
        error
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
    } catch (error) {
      console.error(
        "Failed to update category status:",
        error
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
