import apiPrivate from "@/app/lib/api/apiPrivate";

import type {
  CreateCategoryFormData,
  UpdateCategoryFormData,
} from "../../validations/admin/category.validation";

export const getCategories = async () => {
  const response = await apiPrivate.get("/admin/categories");

  return response.data;
};

export const getCategoryById = async (id: number) => {
  const response = await apiPrivate.get(
    `/admin/categories/${id}`
  );

  return response.data;
};

export const createCategory = async (
  data: CreateCategoryFormData
) => {
  const response = await apiPrivate.post(
    "/admin/categories",
    data
  );

  return response.data;
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryFormData
) => {
  const response = await apiPrivate.patch(
    `/admin/categories/${id}`,
    data
  );

  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await apiPrivate.delete(
    `/admin/categories/${id}`
  );

  return response.data;
};