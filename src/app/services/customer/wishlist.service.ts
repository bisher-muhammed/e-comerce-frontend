import type { AxiosRequestConfig } from "axios";

import apiPrivate from "@/app/lib/api/apiPrivate";

export interface WishlistImage {
  id: number;
  url: string;
  publicId: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface WishlistSize {
  id: number;
  name: string;
  sortOrder: number;
}

export interface WishlistVariant {
  id: number;

  price: string;

  originalPrice?: number;
  finalPrice?: number;
  discountPercentage?: number | null;

  stock: number;
  size: WishlistSize;
}

export function lowestWishlistPrice(
  variants: WishlistVariant[]
): { price: number; originalPrice: number } | null {
  let best: { price: number; originalPrice: number } | null = null;

  for (const variant of variants) {
    const base = Number(variant.price);

    const price =
      typeof variant.finalPrice === "number"
        ? variant.finalPrice
        : base;

    const originalPrice =
      typeof variant.originalPrice === "number"
        ? variant.originalPrice
        : base;

    if (!Number.isFinite(price)) continue;

    if (!best || price < best.price) {
      best = { price, originalPrice };
    }
  }

  return best;
}

export interface WishlistColor {
  id: number;
  name: string;
  slug: string;
  hexCode: string | null;
}

export interface WishlistProductColor {
  id: number;
  color: WishlistColor;
  images: WishlistImage[];
  variants: WishlistVariant[];
}

export interface WishlistProduct {
  id: number;
  name: string;

  slug: string;
  description: string | null;
  details: string | null;
  isActive: boolean;
  colors: WishlistProductColor[];
}

export interface WishlistItem {
  id: number;
  productId: number;
  product: WishlistProduct;
  createdAt: string;
  updatedAt: string;

}

export interface Wishlist {
  id: number;
  userId: number;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data: Wishlist | null;
}


export interface WishlistItemResponse {
  success: boolean;
  message: string;
  data: WishlistItem;
}

// GET WISHLIST

export const getWishlist = async (
  options?: AxiosRequestConfig
): Promise<WishlistResponse> => {
  const response = await apiPrivate.get<WishlistResponse>(
    "/customer/wishlist",
    options
  );

  return response.data;
};

// ADD PRODUCT TO WISHLIST

export const addWishlistItem = async (
  productId: number
): Promise<WishlistItemResponse> => {
  const response = await apiPrivate.post<WishlistItemResponse>(
    "/customer/wishlist/items",
    {
      productId,
    }
  );

  return response.data;
};

// REMOVE PRODUCT FROM WISHLIST

export const removeWishlistItem = async (
  productId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await apiPrivate.delete(
    `/customer/wishlist/items/${productId}`
  );

  return response.data;
};
