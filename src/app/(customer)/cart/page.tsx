// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, RotateCcw, Truck } from "lucide-react";

import CartItemRow from "./components/CartItemRow";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  type Cart,
} from "@/app/services/customer/cart.service";
import { getApiErrorMessage } from "@/app/lib/api/apiError";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const response = await getCart();
        if (!cancelled) setCart(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load cart"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setActionError(null);
      const response = await updateCartItem(cartItemId, { quantity });

      setCart((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === cartItemId ? response.data : item
              ),
            }
          : prev
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update cart item"));
      throw err;
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      setActionError(null);
      await removeCartItem(cartItemId);

      setCart((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((item) => item.id !== cartItemId) }
          : prev
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to remove cart item"));
      throw err;
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Loading cart...</div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-gray-500">
        Your cart is empty.
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (total, item) => total + Number(item.productVariant.price) * item.quantity,
    0
  );

  const hasStockIssue = cart.items.some(
    (item) =>
      item.productVariant.stock === 0 || item.quantity > item.productVariant.stock
  );

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Review your order
          </p>
          <h1 className="text-3xl">
            Shopping Cart{" "}
            <span className="text-lg text-gray-500">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>

        <Link
          href="/customer"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
        >
          <ChevronLeft size={16} />
          Continue shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-6 border-b pb-2 text-xs uppercase tracking-wide text-gray-400">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
            <span />
          </div>

          {actionError && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {actionError}
            </div>
          )}

          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded bg-gray-50 p-6">
          <p className="mb-4 text-xs uppercase tracking-wide text-gray-500">
            Order summary
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="font-medium">Total</span>
            <div className="text-right">
              <span className="text-lg font-semibold">₹{subtotal.toFixed(2)}</span>
              <p className="text-xs text-gray-400">incl. tax</p>
            </div>
          </div>

          {hasStockIssue && (
            <p className="mt-3 text-sm text-red-600">
              Some items in your cart are no longer available in the requested
              quantity.
            </p>
          )}

          {/* No checkout route exists yet — this button is a placeholder */}
          <Link
  href="/checkout"
  aria-disabled={hasStockIssue}
  className={`mt-6 block w-full rounded bg-black py-3 text-center text-white ${
    hasStockIssue
      ? "pointer-events-none cursor-not-allowed opacity-40"
      : ""
  }`}
>
  Proceed to checkout
</Link>

          {/* No payment integration exists — decorative only */}
          <button
            type="button"
            disabled
            className="mt-3 w-full rounded border py-3 text-sm text-gray-400"
          >
            Pay with card
          </button>

          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Lock size={14} /> SSL secured checkout
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={14} /> Free 30-day returns
            </div>
            <div className="flex items-center gap-2">
              <Truck size={14} /> Free delivery over ₹75
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
