"use client";


import { useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useFieldArray,
  type Resolver,
  type UseFieldArrayReturn,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Star, X } from "lucide-react";

import apiPrivate from "@/app/lib/api/apiPrivate";
import { getApiErrorMessage } from "@/app/lib/api/apiError";

import {
  createProductSchema,
  updateProductSchema,
} from "@/app/validations/admin/product.validation";

import {
  createProduct,
  updateProduct,
  getProductById,
} from "@/app/services/admin/product.service";


interface ImageFormValue {
  existing?: true;
  id?: number;
  file?: File;
  previewUrl?: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface VariantFormValue {
  sizeId: number;
  price: number;
  stock: number;
}

interface ColorFormValue {
  colorId: number;
  images: ImageFormValue[];
  variants: VariantFormValue[];
}

type ImagePayload =
  | {
      existing: true;
      id: number;
      altText?: string;
      sortOrder: number;
      isPrimary: boolean;
    }
  | {
      file: File;
      altText?: string;
      sortOrder: number;
      isPrimary: boolean;
    };

interface ProductFormValues {
  name: string;
  slug: string;
  description?: string;
  details?: string;
  categoryId: number;
  isActive: boolean;
  colors: ColorFormValue[];
}

interface OptionItem {
  id: number;
  name: string;
}



const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyImage = (): ImageFormValue => ({
  altText: "",
  sortOrder: 0,
  isPrimary: false,
});

const emptyVariant = (): VariantFormValue => ({
  sizeId: 0,
  price: 0,
  stock: 0,
});

const emptyColor = (): ColorFormValue => ({
  colorId: 0,
  images: [emptyImage()],
  variants: [emptyVariant()],
});



interface ProductFormProps {
  productId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}



export default function ProductForm({
  productId,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEditMode = productId !== undefined;

  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [colors, setColors] = useState<OptionItem[]>([]);
  const [sizes, setSizes] = useState<OptionItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resolver = useMemo(
    () =>
      zodResolver(
        isEditMode ? updateProductSchema : createProductSchema
      ) as unknown as Resolver<ProductFormValues>,
    [isEditMode]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      details: "",
      categoryId: 0,
      isActive: true,
      colors: [emptyColor()],
    },
  });

  const colorArray = useFieldArray({ control, name: "colors" });


  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        const [categoryRes, colorRes, sizeRes] = await Promise.all([
          apiPrivate.get("/admin/categories"),
          apiPrivate.get("/admin/colors"),
          apiPrivate.get("/admin/sizes"),
        ]);

        if (cancelled) return;

        setCategories(categoryRes.data?.data ?? []);
        setColors(colorRes.data?.data ?? []);
        setSizes(sizeRes.data?.data ?? []);
      } catch (error) {
        console.error("Failed to load form options:", error);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);



  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoadingProduct(true);

        const res = await getProductById(productId!);
        const product = res.data?.data;

        if (!product || cancelled) return;

        reset({
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          details: product.details ?? "",
          categoryId: product.categoryId,
          isActive: product.isActive,

          colors: product.colors.map(
            (color: {
              colorId: number;
              images: Array<{
                id: number;
                url: string;
                altText: string | null;
                sortOrder: number;
                isPrimary: boolean;
              }>;
              variants: Array<{
                sizeId: number;
                price: string | number;
                stock: number;
              }>;
            }) => ({
              colorId: color.colorId,

              images: color.images.map((image) => ({
                existing: true as const,
                id: image.id,
                previewUrl: image.url,
                altText: image.altText ?? "",
                sortOrder: image.sortOrder,
                isPrimary: image.isPrimary,
              })),

              variants: color.variants.map((variant) => ({
                sizeId: variant.sizeId,
                price: Number(variant.price),
                stock: variant.stock,
              })),
            })
          ),
        });
      } catch (error) {
        console.error("Failed to load product:", error);

        if (!cancelled) {
          setFormError(
            getApiErrorMessage(
              error,
              "Failed to load product details."
            )
          );
        }
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
   
  }, [productId, isEditMode]);



  const nameValue = watch("name");

  useEffect(() => {
    if (isEditMode) return;
    setValue("slug", slugify(nameValue || ""));
  }, [nameValue, isEditMode]);



  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);

    const hasImageWithoutFile = values.colors.some((color) =>
      color.images.some(
        (image) =>
          !(image.existing && image.id !== undefined) &&
          !image.file
      )
    );

    if (hasImageWithoutFile) {
      setFormError(
        "One or more images is missing a file. Please re-select it."
      );
      return;
    }

    setSaving(true);

    try {
      const colorsPayload = values.colors.map((color) => ({
        colorId: color.colorId,
        variants: color.variants,

        images: color.images.flatMap<ImagePayload>((image) => {
          if (image.existing && image.id !== undefined) {
            return [
              {
                existing: true as const,
                id: image.id,
                altText: image.altText,
                sortOrder: image.sortOrder,
                isPrimary: image.isPrimary,
              },
            ];
          }

          if (!image.file) {
            return [];
          }

          return [
            {
              file: image.file,
              altText: image.altText,
              sortOrder: image.sortOrder,
              isPrimary: image.isPrimary,
            },
          ];
        }),
      }));

      if (isEditMode) {
        await updateProduct(productId!, {
          name: values.name,
          slug: values.slug,
          description: values.description,
          details: values.details,
          categoryId: values.categoryId,
          isActive: values.isActive,
          colors: colorsPayload,
        } as never);
      } else {
        await createProduct({
          name: values.name,
          slug: values.slug,
          description: values.description,
          details: values.details,
          categoryId: values.categoryId,
          isActive: values.isActive,
          colors: colorsPayload,
        } as never);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save product:", error);
      setFormError(
        getApiErrorMessage(
          error,
          "Failed to save product. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const busy = loadingOptions || loadingProduct;

  if (busy) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        Loading form...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {formError && (
        <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="product-name"
              className="mb-1 block text-xs font-medium"
            >
              Name
            </label>
            <input
              {...register("name")}
              id="product-name"
              className="h-10 w-full border border-border px-3 text-sm"
              placeholder="Classic Cotton T-Shirt"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-slug"
              className="mb-1 block text-xs font-medium"
            >
              Slug
            </label>
            <input
              {...register("slug")}
              id="product-slug"
              className="h-10 w-full border border-border px-3 text-sm"
              placeholder="classic-cotton-t-shirt"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-destructive">
                {errors.slug.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="mb-1 block text-xs font-medium"
          >
            Description
          </label>
          <textarea
            {...register("description")}
            id="product-description"
            rows={2}
            className="w-full border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="product-details"
            className="mb-1 block text-xs font-medium"
          >
            Details
          </label>
          <textarea
            {...register("details")}
            id="product-details"
            rows={4}
            className="w-full border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="product-category"
              className="mb-1 block text-xs font-medium"
            >
              Category
            </label>
            <select
              {...register("categoryId", { valueAsNumber: true })}
              id="product-category"
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            >
              <option value={0}>Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("isActive")} />
              Active (visible to customers)
            </label>
          </div>
        </div>
      </section>


      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Colors</h3>

          <button
            type="button"
            onClick={() => colorArray.append(emptyColor())}
            className="flex items-center gap-1 border border-border px-3 py-1.5 text-xs hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Color
          </button>
        </div>

        {typeof errors.colors?.message === "string" && (
          <p className="text-xs text-destructive">
            {errors.colors.message}
          </p>
        )}

        {colorArray.fields.map((field, colorIndex) => (
          <ColorCard
            key={field.id}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            colorIndex={colorIndex}
            colorArray={colorArray}
            colorOptions={colors}
            sizeOptions={sizes}
            errors={errors}
          />
        ))}
      </section>


      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-10 border border-border px-4 text-sm hover:bg-secondary"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="h-10 bg-foreground px-4 text-sm text-background disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : isEditMode
              ? "Save Changes"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}



interface ColorCardProps {
  control: Control<ProductFormValues>;
  register: ReturnType<typeof useForm<ProductFormValues>>["register"];
  watch: ReturnType<typeof useForm<ProductFormValues>>["watch"];
  setValue: ReturnType<typeof useForm<ProductFormValues>>["setValue"];
  colorIndex: number;
  colorArray: UseFieldArrayReturn<ProductFormValues, "colors">;
  colorOptions: OptionItem[];
  sizeOptions: OptionItem[];
  errors: ReturnType<typeof useForm<ProductFormValues>>["formState"]["errors"];
}

function ColorCard({
  control,
  register,
  watch,
  setValue,
  colorIndex,
  colorArray,
  colorOptions,
  sizeOptions,
  errors,
}: ColorCardProps) {
  const imageArray = useFieldArray({
    control,
    name: `colors.${colorIndex}.images`,
  });

  const variantArray = useFieldArray({
    control,
    name: `colors.${colorIndex}.variants`,
  });

  const images = watch(`colors.${colorIndex}.images`);

  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    Array.from(fileList).forEach((file) => {
      const previewUrl = URL.createObjectURL(file);

      objectUrlsRef.current.add(previewUrl);

      imageArray.append({
        file,
        previewUrl,
        altText: "",
        sortOrder: imageArray.fields.length,
        isPrimary: imageArray.fields.length === 0,
      });
    });
  };

  const handleRemoveImage = (imageIndex: number) => {
    const previewUrl = images?.[imageIndex]?.previewUrl;

    if (previewUrl && objectUrlsRef.current.has(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
      objectUrlsRef.current.delete(previewUrl);
    }

    imageArray.remove(imageIndex);
  };

  const setPrimary = (targetIndex: number) => {
    images.forEach((_, index) => {
      setValue(
        `colors.${colorIndex}.images.${index}.isPrimary`,
        index === targetIndex
      );
    });
  };

  const colorErrors = errors.colors?.[colorIndex];

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
        <div className="flex items-center gap-3">
          <label
            htmlFor={`product-color-${colorIndex}`}
            className="text-xs font-medium"
          >
            Color
          </label>
          <select
            {...register(`colors.${colorIndex}.colorId`, {
              valueAsNumber: true,
            })}
            id={`product-color-${colorIndex}`}
            className="h-8 border border-border bg-background px-2 text-sm"
          >
            <option value={0}>Select a color</option>
            {colorOptions.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        {colorArray.fields.length > 1 && (
          <button
            type="button"
            onClick={() => colorArray.remove(colorIndex)}
            className="flex items-center gap-1 text-xs text-destructive hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove Color
          </button>
        )}
      </div>

      <div className="space-y-6 p-4">
        {/* IMAGES */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium">Images</p>

            <label className="flex cursor-pointer items-center gap-1 border border-border px-3 py-1.5 text-xs hover:bg-secondary">
              <Plus className="h-3.5 w-3.5" />
              Add Images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />
            </label>
          </div>

          {typeof colorErrors?.images?.message === "string" && (
            <p className="mb-2 text-xs text-destructive">
              {colorErrors.images.message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imageArray.fields.map((field, imageIndex) => {
              const image = images?.[imageIndex];

              return (
                <div
                  key={field.id}
                  className="relative border border-border p-2"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imageIndex)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-background/90"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {image?.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.previewUrl}
                      alt=""
                      className="mb-2 h-20 w-full object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setPrimary(imageIndex)}
                    className={`mb-1 flex w-full items-center justify-center gap-1 border px-2 py-1 text-[11px] ${
                      image?.isPrimary
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                    }`}
                  >
                    <Star className="h-3 w-3" />
                    {image?.isPrimary ? "Primary" : "Set primary"}
                  </button>

                  <input
                    {...register(
                      `colors.${colorIndex}.images.${imageIndex}.altText`
                    )}
                    aria-label={`Alt text for image ${imageIndex + 1}`}
                    placeholder="Alt text"
                    className="h-7 w-full border border-border px-2 text-[11px]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* VARIANTS */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium">Sizes / Stock / Price</p>

            <button
              type="button"
              onClick={() => variantArray.append(emptyVariant())}
              className="flex items-center gap-1 border border-border px-3 py-1.5 text-xs hover:bg-secondary"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Variant
            </button>
          </div>

          {typeof colorErrors?.variants?.message === "string" && (
            <p className="mb-2 text-xs text-destructive">
              {colorErrors.variants.message}
            </p>
          )}

          <div className="space-y-2">
            {variantArray.fields.map((field, variantIndex) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2"
              >
                <select
                  {...register(
                    `colors.${colorIndex}.variants.${variantIndex}.sizeId`,
                    { valueAsNumber: true }
                  )}
                  aria-label={`Size for variant ${variantIndex + 1}`}
                  className="h-9 border border-border bg-background px-2 text-sm"
                >
                  <option value={0}>Size</option>
                  {sizeOptions.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  aria-label={`Price for variant ${variantIndex + 1}`}
                  {...register(
                    `colors.${colorIndex}.variants.${variantIndex}.price`,
                    { valueAsNumber: true }
                  )}
                  className="h-9 border border-border px-2 text-sm"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  aria-label={`Stock for variant ${variantIndex + 1}`}
                  {...register(
                    `colors.${colorIndex}.variants.${variantIndex}.stock`,
                    { valueAsNumber: true }
                  )}
                  className="h-9 border border-border px-2 text-sm"
                />

                {variantArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => variantArray.remove(variantIndex)}
                    className="flex h-9 w-9 items-center justify-center text-destructive hover:bg-secondary"
                    aria-label="Remove variant"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}