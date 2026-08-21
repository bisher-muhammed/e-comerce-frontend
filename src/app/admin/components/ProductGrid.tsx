"use client";

import { Pencil, Trash2, Tag, ImageOff } from "lucide-react";

interface ProductColorImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductVariant {
  id: number;
  sizeId: number;
  price: string;
  stock: number;
  size: {
    id: number;
    name: string;
  };
}

interface ProductColor {
  id: number;
  colorId: number;
  color: {
    id: number;
    name: string;
    slug: string;
    hexCode: string;
  };
  images: ProductColorImage[];
  variants: ProductVariant[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  colors?: ProductColor[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function getPrimaryImage(product: Product): ProductColorImage | null {
  if (!product.colors?.length) {
    return null;
  }

  for (const color of product.colors) {
    const primary = color.images?.find((img) => img.isPrimary);

    if (primary) {
      return primary;
    }
  }

  for (const color of product.colors) {
    if (color.images?.length) {
      return color.images[0];
    }
  }

  return null;
}

function getPriceDisplay(product: Product): string | null {
  const prices =
    product.colors
      ?.flatMap((color) => color.variants ?? [])
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price)) ?? [];

  if (prices.length === 0) {
    return null;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? `$${min.toFixed(2)}`
    : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
}

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (product: Product) => void;
}

export default function ProductGrid({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full border border-border px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No products found.
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Products you create will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-wrap gap-4">
      {products.map((product) => {
        const primaryImage = getPrimaryImage(product);
        const price = getPriceDisplay(product);

        return (
          <div
            key={product.id}
            className="
              group
              flex
              min-w-0
              max-w-full
              flex-1
              flex-col
              overflow-hidden
              border
              border-border
              bg-card
              transition-colors
              hover:border-foreground/30

              basis-full
              sm:basis-[calc(50%-0.5rem)]
              lg:basis-[calc(33.333%-0.667rem)]
              xl:basis-[calc(25%-0.75rem)]
            "
          >
            {/* Image */}
            <div className="aspect-square w-full overflow-hidden border-b border-border bg-secondary/40">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.altText ?? product.name}
                  className="block h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-col p-4">
              {/* Header */}
              <div className="flex min-w-0 items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {product.slug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(product)}
                  aria-pressed={product.isActive}
                  className={`flex shrink-0 items-center gap-1.5 border px-2 py-1 text-[11px] font-medium ${
                    product.isActive
                      ? "border-green-600/30 text-green-700"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      product.isActive
                        ? "bg-green-600"
                        : "bg-muted-foreground"
                    }`}
                  />

                  {product.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Category */}
              <div className="mt-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate">
                  {product.category?.name ?? "Uncategorized"}
                </span>
              </div>

              {/* Price */}
              {price && (
                <p className="mt-2 text-sm font-semibold">
                  {price}
                </p>
              )}

              {/* Description */}
              {product.description && (
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {product.description}
                </p>
              )}

              {/* Actions */}
              <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={`Edit ${product.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="flex h-8 w-8 items-center justify-center text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

