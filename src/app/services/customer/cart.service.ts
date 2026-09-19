import type { AxiosRequestConfig } from "axios";

import apiPrivate from "@/app/lib/api/apiPrivate";

import type {
  AddToCartInput,
  UpdateCartItemInput,
} from "@/app/validations/customer/cart.validation";

export interface CartImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface CartColor {
  id: number;
  name: string;
  slug: string;
  hexCode: string | null;
}

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  categoryId: number;
  isActive: boolean;
}

export interface CartSize {
  id: number;
  name: string;
  sortOrder: number;
}

export interface CartProductColor {
  id: number;
  productId: number;
  colorId: number;
  color: CartColor;
  product: CartProduct;
  images: CartImage[];
}

export interface CartProductVariant {
  id: number;
  productColorId: number;
  sizeId: number;

  // Prisma Decimal is serialized as a string.
  price: string;

  stock: number;

  size: CartSize;
  productColor: CartProductColor;
}

export interface CartItem {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;

  productVariant: CartProductVariant;

  // Effective pricing calculated by the backend
  originalPrice: number;
  finalPrice: number;
  discountPercentage: number | null;
  offerSource: "PRODUCT" | "CATEGORY" | null;

  lineTotal: string;
  priceChanged: boolean;

  isAvailable?: boolean;
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  subtotal:string;
  hasUnavailableItems?: boolean;
}

export const isCartLineBlocked = (item: CartItem): boolean =>
  item.isAvailable === false ||
  item.productVariant.stock === 0 ||
  item.quantity > item.productVariant.stock;

export const cartHasBlockingIssue = (cart: Cart): boolean =>
  Boolean(cart.hasUnavailableItems) ||
  cart.items.some(isCartLineBlocked);

export interface CartResponse {
  success: boolean;
  message?: string;
  data: Cart;
}

export interface CartItemResponse {
  success: boolean;
  message?: string;
  data: CartItem;
}

export const addToCart = async (
  data: AddToCartInput
): Promise<CartItemResponse> => {
  const response = await apiPrivate.post<CartItemResponse>(
    "/customer/cart",
    data
  );

  return response.data;
};

export const getCart = async (
  options?: AxiosRequestConfig
): Promise<CartResponse> => {
  const response = await apiPrivate.get<CartResponse>(
    "/customer/cart",
    options
  );

  return response.data;
};

export const updateCartItem = async (
  cartItemId: number,
  data: UpdateCartItemInput
): Promise<CartItemResponse> => {
  const response = await apiPrivate.patch<CartItemResponse>(
    `/customer/cart/${cartItemId}`,
    data
  );

  return response.data;
};

export const removeCartItem = async (
  cartItemId: number
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiPrivate.delete(
    `/customer/cart/${cartItemId}`
  );

  return response.data;
};
