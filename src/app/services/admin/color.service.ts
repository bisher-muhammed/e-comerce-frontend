import apiPrivate from "@/app/lib/api/apiPrivate";

import type {
  CreateColorFormData,
  UpdateColorFormData,
} from "@/app/validations/admin/color.validation";

export interface Color {
  id: number;
  name: string;
  slug: string;
  hexCode: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const createColor = async (
  data: CreateColorFormData
): Promise<Color> => {
  const response =
    await apiPrivate.post<ApiResponse<Color>>(
      "/admin/colors",
      data
    );

  return response.data.data;
};

export const getColors = async (): Promise<Color[]> => {
  const response =
    await apiPrivate.get<ApiResponse<Color[]>>(
      "/admin/colors"
    );

  return response.data.data;
};

export const getColorById = async (
  id: number
): Promise<Color> => {
  const response =
    await apiPrivate.get<ApiResponse<Color>>(
      `/admin/colors/${id}`
    );

  return response.data.data;
};

export const updateColor = async (
  id: number,
  data: UpdateColorFormData
): Promise<Color> => {
  const response =
    await apiPrivate.patch<ApiResponse<Color>>(
      `/admin/colors/${id}`,
      data
    );

  return response.data.data;
};

export const deleteColor = async (
  id: number
): Promise<void> => {
  await apiPrivate.delete(
    `/admin/colors/${id}`
  );
};
