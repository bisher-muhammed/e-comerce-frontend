"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createCategorySchema,
  type CreateCategoryFormData,
} from "@/app/validations/admin/category.validation";

interface CategoryFormProps {
  initialData?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
  };

  onSubmit: (
    data: CreateCategoryFormData
  ) => Promise<void>;

  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description ?? "",
        isActive: initialData.isActive ?? true,
      });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        isActive: true,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Category Name
        </label>

        <input
          {...register("name")}
          type="text"
          placeholder="Example: Shirts"
          className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        />

        {errors.name && (
          <p className="mt-1 text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Slug
        </label>

        <input
          {...register("slug")}
          type="text"
          placeholder="shirts"
          className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        />

        {errors.slug && (
          <p className="mt-1 text-xs text-destructive">
            {errors.slug.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Description
        </label>

        <textarea
          {...register("description")}
          rows={4}
          placeholder="Category description..."
          className="w-full resize-none border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />

        {errors.description && (
          <p className="mt-1 text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Active */}
      <label className="flex items-center gap-2 text-sm">
        <input
          {...register("isActive")}
          type="checkbox"
          className="h-4 w-4"
        />

        <span>Active category</span>
      </label>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-10 px-4 text-sm text-muted-foreground hover:bg-secondary"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="h-10 bg-foreground px-5 text-sm text-background disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}
