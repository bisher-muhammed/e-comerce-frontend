"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createSizeSchema,
  type CreateSizeFormInput,
  type CreateSizeFormData,
} from "@/app/validations/admin/size.validation";

interface SizeFormProps {
  initialData?: CreateSizeFormData & {
    id: number;
  };

  onSubmit: (
    data: CreateSizeFormData
  ) => Promise<void>;

  onCancel: () => void;
  loading?: boolean;
}

export default function SizeForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: SizeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    CreateSizeFormInput,
    any,
    CreateSizeFormData
  >({
    resolver: zodResolver(createSizeSchema),

    defaultValues: {
      name: "",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        sortOrder: initialData.sortOrder,
      });
    } else {
      reset({
        name: "",
        sortOrder: 0,
      });
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Size Name
        </label>

        <input
          {...register("name")}
          type="text"
          placeholder="Example: XL"
          className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        />

        {errors.name && (
          <p className="mt-1 text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Sort Order */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Sort Order
        </label>

        <input
          {...register("sortOrder", {
            valueAsNumber: true,
          })}
          type="number"
          min={0}
          placeholder="0"
          className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        />

        {errors.sortOrder && (
          <p className="mt-1 text-xs text-destructive">
            {errors.sortOrder.message}
          </p>
        )}

        <p className="mt-1 text-xs text-muted-foreground">
          Controls the order in which sizes are displayed.
        </p>
      </div>

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
              ? "Update Size"
              : "Create Size"}
        </button>
      </div>
    </form>
  );
}
