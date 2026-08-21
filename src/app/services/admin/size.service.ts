import apiPrivate from "@/app/lib/api/apiPrivate";

export interface Size {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSizeData {
  name: string;
  sortOrder: number;
}

export type UpdateSizeData = Partial<CreateSizeData>;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const createSize = async (
  data: CreateSizeData
): Promise<Size> => {
  const response = await apiPrivate.post<ApiResponse<Size>>(
    "/admin/sizes",
    data
  );

  return response.data.data;
};

export const getSizes = async (): Promise<Size[]> => {
  const response = await apiPrivate.get<ApiResponse<Size[]>>(
    "/admin/sizes"
  );

  return response.data.data;
};

export const getSizeById = async (
  id: number
): Promise<Size> => {
  const response = await apiPrivate.get<ApiResponse<Size>>(
    `/admin/sizes/${id}`
  );

  return response.data.data;
};

export const updateSize = async (
  id: number,
  data: UpdateSizeData
): Promise<Size> => {
  const response = await apiPrivate.patch<ApiResponse<Size>>(
    `/admin/sizes/${id}`,
    data
  );

  return response.data.data;
};

export const deleteSize = async (
  id: number
): Promise<void> => {
  await apiPrivate.delete(`/admin/sizes/${id}`);
};
