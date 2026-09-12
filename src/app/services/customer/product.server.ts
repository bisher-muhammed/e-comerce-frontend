import { cache } from "react";

import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";

export const getProductBySlugServer = cache(
  async (slug: string): Promise<Product | null> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/products/${encodeURIComponent(
        slug
      )}`,
      { cache: "no-store" }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load product "${slug}" (${response.status})`
      );
    }

    const payload = await response.json();

    return payload.data as Product;
  }
);
