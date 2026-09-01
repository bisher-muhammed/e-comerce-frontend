"use client";

import Image from "next/image";
import { useState } from "react";
import {
  WishlistItem,
  removeWishlistItem,
} from "@/app/services/customer/wishlist.service"

import { getApiErrorMessage } from "@/app/lib/api/apiError";

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (productId: number) => void;
}

export default function WishlistItemCard({
  item,
  onRemove,
}: WishlistItemCardProps) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = item.product;

  // Find the first primary image
  const image =
    product.colors
      .flatMap((color) => color.images)
      .find((image) => image.isPrimary) ??
    product.colors
      .flatMap((color) => color.images)[0];

  // Get all variants
  const variants = product.colors.flatMap(
    (color) => color.variants
  );

  const availableVariants = variants.filter(
    (variant) => variant.stock > 0
  );

  const isOutOfStock = availableVariants.length === 0;

  // Current minimum price
  const prices = variants.map((variant) =>
    Number(variant.price)
  );

  const minPrice = prices.length
    ? Math.min(...prices)
    : null;

  const handleRemove = async () => {
    try {
      setRemoving(true);
      setError(null);

      await removeWishlistItem(product.id);

      onRemove(product.id);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to remove product from wishlist"
        )
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <article className="border rounded-lg overflow-hidden bg-white">
      <div className="relative aspect-square bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-lg">
          {product.name}
        </h2>

        {minPrice !== null && (
          <p className="mt-2 font-medium">
            From ₹{minPrice.toFixed(2)}
          </p>
        )}

        {isOutOfStock ? (
          <p className="mt-2 text-sm text-red-600">
            Out of stock
          </p>
        ) : (
          <p className="mt-2 text-sm text-green-600">
            In stock
          </p>
        )}

        {!product.isActive && (
          <p className="mt-2 text-sm text-red-600">
            Product unavailable
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="mt-4 w-full rounded-md border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
        >
          {removing ? "Removing..." : "Remove"}
        </button>
      </div>
    </article>
  );
}
