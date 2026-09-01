"use client";

import { useEffect, useState } from "react";

import {
  getWishlist,
  WishlistItem,
} from "@/app/services/customer/wishlist.service"

import WishlistItemCard from "./WishlistItemCard";

import { getApiErrorMessage } from "@/app/lib/api/apiError"

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getWishlist();

        setItems(response.data?.items ?? []);
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
            "Failed to load wishlist"
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = (productId: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.productId !== productId
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">
          Your wishlist is empty
        </h2>

        <p className="mt-2 text-gray-500">
          Save products you want to come back to later.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          My Wishlist
        </h1>

        <p className="text-gray-500 mt-1">
          {items.length}{" "}
          {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </section>
  );
}

