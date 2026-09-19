import { cache } from "react";

import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";
import {
  API_URL,
  SERVER_FETCH_TIMEOUT_MS,
} from "@/app/lib/api/config";

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ServerProductList {
  products: Product[];
  pagination: ProductPagination | null;
}

export const getProductBySlugServer = cache(
  async (slug: string): Promise<Product | null> => {
    const response = await fetch(
      `${API_URL}/customer/products/${encodeURIComponent(
        slug
      )}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
      }
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
      `${API_URL}/customer/products?${search.toString()}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
      }
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
