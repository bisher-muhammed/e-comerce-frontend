"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  WishlistItem,
  removeWishlistItem,
} from "@/app/services/customer/wishlist.service"

import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useStoreData } from "@/app/components/store/StoreDataProvider";

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (productId: number) => void;
}

export default function WishlistItemCard({
  item,
  onRemove,
}: WishlistItemCardProps) {
  const { setWishlisted } = useStoreData();

  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = item.product;

  const productUrl = `/customer/products/${product.slug}`;

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

      setWishlisted(product.id, false);
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

  const media = (
    <div className="relative aspect-square bg-gray-100">
      {image ? (
        <Image
          src={image.url}
          alt={image.altText || product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          No image
        </div>
      )}
    </div>
  );

  return (
    <article className="border rounded-lg overflow-hidden bg-white">
      {product.isActive ? (
        <Link
          href={productUrl}
          aria-label={`View ${product.name}`}
          className="block"
        >
          {media}
        </Link>
      ) : (
        media
      )}

      <div className="p-4">
        <h2 className="font-semibold text-lg">
          {product.isActive ? (
            <Link
              href={productUrl}
              className="hover:underline"
            >
              {product.name}
            </Link>
          ) : (
            product.name
          )}
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
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          {product.isActive && (
            <Link
              href={productUrl}
              className="flex-1 rounded-md border px-4 py-2 text-center hover:bg-gray-100"
            >
              View product
            </Link>
          )}

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="flex-1 rounded-md border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}
