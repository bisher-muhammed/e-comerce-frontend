
"use client";

import { useState } from "react";

import Image from "next/image";

import { X } from "lucide-react";

import type { CartItem } from "@/app/services/customer/cart.service";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (
    cartItemId: number,
    quantity: number
  ) => Promise<void>;
  onRemove: (cartItemId: number) => Promise<void>;
}

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const price = Number(item.finalPrice);
  const originalPrice = Number(item.originalPrice);

  const product = item.productVariant.productColor.product;
  const color = item.productVariant.productColor.color;
  const images = item.productVariant.productColor.images;

  const primaryImage =
    images.find((img) => img.isPrimary) ?? images[0];

  const stock = item.productVariant.stock;
  const isUnavailable = item.isAvailable === false;
  const isOutOfStock = stock === 0;
  const exceedsStock = localQuantity > stock;

  const hasDiscount =
    item.discountPercentage !== null &&
    item.finalPrice < item.originalPrice;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    if (newQuantity > localQuantity && newQuantity > stock) return;

    const previous = localQuantity;

    setLocalQuantity(newQuantity);
    setIsUpdating(true);

    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch {
      setLocalQuantity(previous);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);

    try {
      await onRemove(item.id);
    } catch {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 border-b border-gray-100 py-6 ${
        isUnavailable ? "opacity-60" : ""
      }`}
    >
      {/* Product */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">
            {product.name}
          </p>

          <p className="text-sm text-gray-500">
            {color.name}
          </p>

          <p className="text-sm text-gray-500">
            Size: {item.productVariant.size.name}
          </p>

          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="font-medium">
              ₹{price.toFixed(2)}
            </span>

            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {hasDiscount && (
            <p className="mt-1 text-xs text-green-600">
              {item.discountPercentage}% off
            </p>
          )}

          {isUnavailable ? (
            <p className="mt-1 text-xs text-red-600">
              No longer available — remove to continue
            </p>
          ) : isOutOfStock ? (
            <p className="mt-1 text-xs text-red-600">
              Currently out of stock
            </p>
          ) : exceedsStock ? (
            <p className="mt-1 text-xs text-red-600">
              Only {stock} {stock === 1 ? "item" : "items"} available.{" "}
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleQuantityChange(stock)}
                className="underline underline-offset-2 disabled:opacity-40"
              >
                Reduce to {stock}
              </button>
            </p>
          ) : stock <= 5 ? (
            <p className="mt-1 text-xs text-orange-600">
              Only {stock} left
            </p>
          ) : null}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center rounded border">
        <button
          type="button"
          className="px-2 py-1 disabled:opacity-40"
          disabled={isUpdating || localQuantity <= 1}
          onClick={() =>
            handleQuantityChange(localQuantity - 1)
          }
        >
          −
        </button>

        <span className="min-w-8 text-center text-sm">
          {localQuantity}
        </span>

        <button
          type="button"
          className="px-2 py-1 disabled:opacity-40"
          disabled={
            isUpdating || isUnavailable || localQuantity >= stock
          }
          onClick={() =>
            handleQuantityChange(localQuantity + 1)
          }
        >
          +
        </button>
      </div>

      <div className="text-sm font-medium">
        {isUnavailable ? "—" : `₹${Number(item.lineTotal).toFixed(2)}`}
      </div>

      {/* Remove */}
      <button
        type="button"
        aria-label="Remove item"
        className="text-gray-400 hover:text-gray-700 disabled:opacity-40"
        disabled={isUpdating}
        onClick={handleRemove}
      >
        <X size={18} />
      </button>
    </div>
  );
}

