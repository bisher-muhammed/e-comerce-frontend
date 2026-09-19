"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  addWishlistItem,
  removeWishlistItem,
} from "@/app/services/customer/wishlist.service";

import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useStoreData } from "@/app/components/store/StoreDataProvider";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;

  category: {
    id: number;
    name: string;
    slug: string;
  };

  colors: {
    id: number;

    color: {
      id: number;
      name: string;
      slug: string;
      hexCode: string | null;
    };

    images: {
      id: number;
      url: string;
      altText: string | null;
      sortOrder: number;
      isPrimary: boolean;
    }[];

    variants: {
      id: number;
      originalPrice: number;
      finalPrice: number;
      discountPercentage: number | null;
      offerSource: "PRODUCT" | "CATEGORY" | null;
      stock: number;

      size: {
        id: number;
        name: string;
        sortOrder: number;
      };
    }[];
  }[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted: isProductWishlisted, setWishlisted } = useStoreData();

  const isWishlisted = isProductWishlisted(product.id);

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const productUrl = `/customer/products/${product.slug}`;

  // -----------------------------
  // IMAGES
  // -----------------------------

  const { primaryImage, hoverImage } = useMemo(() => {
    const primaryColor = product.colors[0];

    const images = primaryColor
      ? [...primaryColor.images].sort((a, b) => a.sortOrder - b.sortOrder)
      : [];

    const primary = images.find((image) => image.isPrimary) ?? images[0];

    return {
      primaryImage: primary,
      hoverImage: images.find((image) => image.id !== primary?.id),
    };
  }, [product.colors]);

  // -----------------------------
  // PRICE
  // -----------------------------
  //
  // bestDiscountPercentage is the MAX discount found across all variants,
  // not tied to the cheapest variant specifically — e.g. if the ₹400 variant
  // is 10% off but a pricier ₹600 variant happens to carry the same offer,
  // the badge should still say "10% OFF" since that's the actual offer
  // percentage, not something derived awkwardly from whichever variant is
  // cheapest. Since offers are product/category scoped (not variant scoped
  // per earlier reasoning), all variants on a product share the same
  // discountPercentage when an offer applies — this is really just reading
  // it off any discounted variant, with a max() as a defensive fallback in
  // case that assumption is ever violated.

  const { lowestOriginalPrice, lowestFinalPrice, hasRange, bestDiscountPercentage } =
    useMemo(() => {
      const variants = product.colors.flatMap((c) => c.variants);

      if (variants.length === 0) {
        return {
          lowestOriginalPrice: null,
          lowestFinalPrice: null,
          hasRange: false,
          bestDiscountPercentage: null as number | null,
        };
      }

      const cheapest = variants.reduce((best, curr) =>
        curr.finalPrice < best.finalPrice ? curr : best
      );

      const allFinalPrices = variants.map((v) => v.finalPrice);
      const lowest = Math.min(...allFinalPrices);
      const highest = Math.max(...allFinalPrices);

      const discountPercentages = variants
        .map((v) => v.discountPercentage)
        .filter((pct): pct is number => pct !== null);

      return {
        lowestOriginalPrice: cheapest.originalPrice,
        lowestFinalPrice: cheapest.finalPrice,
        hasRange: lowest !== highest,
        bestDiscountPercentage:
          discountPercentages.length > 0 ? Math.max(...discountPercentages) : null,
      };
    }, [product.colors]);

  const hasDiscount = bestDiscountPercentage !== null;

  // -----------------------------
  // STOCK
  // -----------------------------

  const totalStock = useMemo(
    () =>
      product.colors.reduce(
        (sum, productColor) =>
          sum +
          productColor.variants.reduce((stock, variant) => stock + variant.stock, 0),
        0
      ),
    [product.colors]
  );

  const isSoldOut = totalStock === 0;
  const isLowStock = !isSoldOut && totalStock <= 3;

  // -----------------------------
  // COLORS
  // -----------------------------

  const swatchLimit = 4;

  const visibleColors = useMemo(
    () => product.colors.slice(0, swatchLimit),
    [product.colors]
  );

  const extraColors = product.colors.length - visibleColors.length;

  // -----------------------------
  // WISHLIST
  // -----------------------------

  const handleWishlist = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (wishlistLoading) return;

      try {
        setWishlistLoading(true);
        setWishlistError(null);

        if (isWishlisted) {
          await removeWishlistItem(product.id);
          setWishlisted(product.id, false);
        } else {
          await addWishlistItem(product.id);
          setWishlisted(product.id, true);
        }
      } catch (error) {
        setWishlistError(getApiErrorMessage(error, "Failed to update wishlist"));
      } finally {
        setWishlistLoading(false);
      }
    },
    [wishlistLoading, isWishlisted, product.id, setWishlisted]
  );

  return (
    <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors duration-200 hover:border-foreground/30">
      {/* Product Image */}
      <div className="relative">
        <Link href={productUrl} className="block" aria-label={`View ${product.name}`}>
          <div className="relative aspect-3/4 overflow-hidden bg-secondary">
            {primaryImage ? (
              <>
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.altText ?? product.name}
                  fill
                  className={`object-cover transition-all duration-300 ${
                    hoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {hoverImage && (
                  <Image
                    src={hoverImage.url}
                    alt={hoverImage.altText ?? product.name}
                    fill
                    className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}

            {/* Top-left badge stack: offer takes priority over stock badges
                when both would otherwise apply, to avoid stacking two
                badges in the same corner. Sold-out already implies no
                purchase is possible, so an offer badge on a sold-out item
                would be misleading — suppress it there. */}
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {isSoldOut && (
                <span className="border border-border bg-background px-2 py-1 text-xs font-medium uppercase tracking-wide text-foreground">
                  Sold out
                </span>
              )}

              {isLowStock && (
                <span className="border border-border bg-background px-2 py-1 text-xs font-medium uppercase tracking-wide text-destructive">
                  Only {totalStock} left
                </span>
              )}

              {hasDiscount && !isSoldOut && (
                <span className="border border-green-700 bg-green-700 px-2 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
                  {bestDiscountPercentage}% OFF
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Wishlist button stays alone in the top-right corner now —
            no longer contested with the discount badge, which moved to
            the top-left badge stack above. */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className={isWishlisted ? "fill-current" : ""}
          />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category.name}
        </p>

        <Link href={productUrl} className="group/name">
          <h2 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover/name:underline">
            {product.name}
          </h2>
        </Link>

        {visibleColors.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="sr-only">
              Available in{" "}
              {visibleColors.map((productColor) => productColor.color.name).join(", ")}
              {extraColors > 0 ? ` and ${extraColors} more` : ""}
            </span>

            {visibleColors.map((productColor) => (
              <span
                key={productColor.id}
                aria-hidden="true"
                title={productColor.color.name}
                className="h-3.5 w-3.5 border border-border"
                style={{ backgroundColor: productColor.color.hexCode ?? "#EDECE8" }}
              />
            ))}

            {extraColors > 0 && (
              <span aria-hidden="true" className="text-xs text-muted-foreground">
                +{extraColors}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          {lowestFinalPrice !== null ? (
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              {hasRange && (
                <span className="text-sm font-normal text-muted-foreground">From</span>
              )}

              <p
                className={`text-sm font-semibold ${
                  hasDiscount ? "text-green-700" : "text-foreground"
                }`}
              >
                ₹{lowestFinalPrice.toFixed(2)}
              </p>

              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{lowestOriginalPrice!.toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Price unavailable</p>
          )}
        </div>

        {wishlistError && (
          <p role="alert" className="text-xs text-destructive">
            {wishlistError}
          </p>
        )}
      </div>
    </article>
  );
}
