import apiPublic from "@/app/lib/api/apiPublic";

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
}

export const getProducts = async (
  params?: ListProductsParams
) => {
  const response = await apiPublic.get(
    "/customer/products",
    { params }
  );

  return response.data;
};


export const getProductBySlug = async (slug: string) => {
  const response = await apiPublic.get(
    `/customer/products/${slug}`
  );

  return response.data.data;
};
