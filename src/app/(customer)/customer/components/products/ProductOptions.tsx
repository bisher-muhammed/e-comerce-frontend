"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";
import { addToCart } from "@/app/services/customer/cart.service";
import {
  addWishlistItem,
  removeWishlistItem,
} from "@/app/services/customer/wishlist.service";
import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useStoreData } from "@/app/components/store/StoreDataProvider";

interface ProductOptionsProps {
  product: Product;

  selectedColorId: number;
  onSelectColor: (colorId: number) => void;

  selectedVariantId: number | null;
  onSelectVariant: (variantId: number) => void;
}

export default function ProductOptions({
  product,
  selectedColorId,
  onSelectColor,
  selectedVariantId,
  onSelectVariant,
}: ProductOptionsProps) {
  const router = useRouter();

  const { isWishlisted: isProductWishlisted, setWishlisted, refreshCart } =
    useStoreData();

  const isWishlisted = isProductWishlisted(product.id);

  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedColor = product.colors.find(
    (color) => color.id === selectedColorId
  );

  const selectedVariant = selectedColor?.variants.find(
    (variant) => variant.id === selectedVariantId
  );

  const canAddToCart = !!selectedVariant && selectedVariant.stock > 0 && !isAdding;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    if (selectedVariant.stock <= 0) return;

    try {
      setError(null);
      setIsAdding(true);

      await addToCart({
        productVariantId: selectedVariant.id,
        quantity: 1,
      });

      await refreshCart();

      router.push("/cart");
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to add product to cart"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (isTogglingWishlist) return;

    try {
      setError(null);
      setIsTogglingWishlist(true);

      if (isWishlisted) {
        await removeWishlistItem(product.id);
        setWishlisted(product.id, false);
      } else {
        await addWishlistItem(product.id);
        setWishlisted(product.id, true);
      }
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update wishlist"));
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Fallback when no size is picked yet: show the cheapest variant in
  // the selected color, same "From ₹X" intent as the card, but scoped
  // to just this color since that's what's visually selected here.
  const fallbackVariant = selectedColor?.variants.reduce(
    (cheapest, variant) =>
      !cheapest || variant.finalPrice < cheapest.finalPrice ? variant : cheapest,
    selectedColor.variants[0]
  );

  const displayVariant = selectedVariant ?? fallbackVariant;
  const hasDiscount = displayVariant?.discountPercentage != null;

  return (
    <div>
      {/* Price */}
      {displayVariant && (
  <div className="flex items-baseline gap-2">
    <p className="text-xl font-semibold text-green-700">
      ₹{displayVariant.finalPrice.toFixed(2)}
    </p>

    {hasDiscount && (
      <>
        <p className="text-base text-muted-foreground line-through">
          ₹{displayVariant.originalPrice.toFixed(2)}
        </p>
        <span className="text-sm font-medium text-green-700">
          {displayVariant.discountPercentage}% off
        </span>
      </>
    )}
  </div>
)}

      {/* Description */}
      {product.description && (
        <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
          {product.description}
        </p>
      )}

      {/* Colors */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Color</h2>

          {selectedColor && (
            <span className="text-sm text-muted-foreground">
              {selectedColor.color.name}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((productColor) => {
            const colorStock = productColor.variants.reduce(
              (sum, variant) => sum + variant.stock,
              0
            );

            const isSelected = productColor.id === selectedColorId;

            return (
              <button
                key={productColor.id}
                type="button"
                title={productColor.color.name}
                aria-label={
                  colorStock === 0
                    ? `${productColor.color.name} — out of stock`
                    : productColor.color.name
                }
                aria-pressed={isSelected}
                onClick={() => onSelectColor(productColor.id)}
                disabled={colorStock === 0}
                className={`h-8 w-8 border transition-colors ${
                  isSelected ? "border-foreground" : "border-border"
                } ${
                  colorStock === 0
                    ? "cursor-not-allowed opacity-30"
                    : "hover:border-foreground/60"
                }`}
                style={{ backgroundColor: productColor.color.hexCode ?? "#EDECE8" }}
              />
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-foreground">Size</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {selectedColor?.variants
            .slice()
            .sort((a, b) => a.size.sortOrder - b.size.sortOrder)
            .map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const isOutOfStock = variant.stock === 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onSelectVariant(variant.id)}
                  disabled={isOutOfStock}
                  aria-label={
                    isOutOfStock
                      ? `Size ${variant.size.name} — out of stock`
                      : `Size ${variant.size.name}`
                  }
                  aria-pressed={isSelected}
                  className={`min-w-12 border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border text-foreground hover:border-foreground/60"
                  } ${
                    isOutOfStock ? "cursor-not-allowed opacity-30 line-through" : ""
                  }`}
                >
                  {variant.size.name}
                </button>
              );
            })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Add to cart */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="flex-1 border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAdding
            ? "Adding..."
            : selectedVariant
              ? selectedVariant.stock > 0
                ? "Add to cart"
                : "Out of stock"
              : "Select a size"}
        </button>

        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="flex h-12 w-12 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
