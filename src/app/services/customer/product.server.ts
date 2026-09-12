import { cache } from "react";

import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";
import type { ProductPagination } from "@/app/services/customer/product.service";

export interface ServerProductList {
  products: Product[];
  pagination: ProductPagination | null;
}

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

export const getProductsServer = cache(
  async (
    page: number,
    limit: number,
    categoryId?: number
  ): Promise<ServerProductList> => {
    const search = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (categoryId !== undefined) {
      search.set("categoryId", String(categoryId));
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/products?${search.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load products (${response.status})`
      );
    }

    const payload = await response.json();

    return {
      products: (payload.data ?? []) as Product[],
      pagination:
        (payload.pagination as ProductPagination | undefined) ??
        null,
    };
  }
);
