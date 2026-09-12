"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createColorSchema,
  type CreateColorFormData,
} from "@/app/validations/admin/color.validation";

interface ColorFormProps {
  initialData?: CreateColorFormData & {
    id: number;
  };

  onSubmit: (
    data: CreateColorFormData
  ) => Promise<void>;

  onCancel: () => void;
  loading?: boolean;
}

export default function ColorForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ColorFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateColorFormData>({
    resolver: zodResolver(createColorSchema),

    defaultValues: {
      name: "",
      slug: "",
      hexCode: "",
    },
  });

  const hexCode = watch("hexCode");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        hexCode: initialData.hexCode ?? "",
      });
    } else {
      reset({
        name: "",
        slug: "",
        hexCode: "",
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
        <label
          htmlFor="color-name"
          className="mb-1.5 block text-sm font-medium"
        >
          Color Name
        </label>

        <input
          {...register("name")}
          id="color-name"
          type="text"
          placeholder="Example: Navy Blue"
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
        <label
          htmlFor="color-slug"
          className="mb-1.5 block text-sm font-medium"
        >
          Slug
        </label>

        <input
          {...register("slug")}
          id="color-slug"
          type="text"
          placeholder="navy-blue"
          className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        />

        {errors.slug && (
          <p className="mt-1 text-xs text-destructive">
            {errors.slug.message}
          </p>
        )}
      </div>

      {/* Hex Code */}
      <div>
        <label
          htmlFor="color-hex"
          className="mb-1.5 block text-sm font-medium"
        >
          Hex Color
        </label>

        <div className="flex gap-3">
          <input
            {...register("hexCode")}
            id="color-hex"
            type="text"
            placeholder="#000000"
            className="h-10 flex-1 border border-border bg-background px-3 text-sm uppercase outline-none focus:border-foreground"
          />

          <div
            aria-hidden="true"
            className="h-10 w-10 shrink-0 border border-border"
            style={{
              backgroundColor:
                hexCode &&
                /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
                  hexCode
                )
                  ? hexCode
                  : "transparent",
            }}
          />
        </div>

        {errors.hexCode && (
          <p className="mt-1 text-xs text-destructive">
            {errors.hexCode.message}
          </p>
        )}
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
              ? "Update Color"
              : "Create Color"}
        </button>
      </div>
    </form>
  );
}
