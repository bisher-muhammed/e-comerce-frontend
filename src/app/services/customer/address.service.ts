import apiPrivate from "@/app/lib/api/apiPrivate";

import type { AddressFormData } from "@/app/validations/customer/address.validation";

export interface Address {
  id: number;
  userId: number;

  label: "HOME" | "OFFICE" | "OTHER";

  firstName: string;
  lastName: string | null;
  phone: string;

  addressLine1: string;
  addressLine2: string;
  landmark: string | null;

  city: string;
  state: string;
  postalCode: string;
  country: string;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
}


export interface AddressResponse {
  success: boolean;
  data: Address;
  message?: string;
}

export interface AddressesResponse {
  success: boolean;
  data: Address[];
  message?: string;
}

// GET ALL ADDRESSES

export const getAddresses = async (): Promise<AddressesResponse> => {
  const response = await apiPrivate.get<AddressesResponse>(
    "/customer/addresses"
  );

  return response.data;
};

// GET SINGLE ADDRESS

export const getAddress = async (
  id: number
): Promise<AddressResponse> => {
  const response = await apiPrivate.get<AddressResponse>(
    `/customer/addresses/${id}`
  );

  return response.data;
};

// CREATE ADDRESS

export const createAddress = async (
  data: AddressFormData
): Promise<AddressResponse> => {
  const response = await apiPrivate.post<AddressResponse>(
    "/customer/addresses",
    data
  );

  return response.data;
};

// UPDATE ADDRESS

export const updateAddress = async (
  id: number,
  data: Partial<AddressFormData>
): Promise<AddressResponse> => {
  const response = await apiPrivate.patch<AddressResponse>(
    `/customer/addresses/${id}`,
    data
  );

  return response.data;
};

// DELETE ADDRESS

export const deleteAddress = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiPrivate.delete<{
    success: boolean;
    message: string;
  }>(`/customer/addresses/${id}`);

  return response.data;
};

// SET DEFAULT ADDRESS

export const setDefaultAddress = async (
  id: number
): Promise<AddressResponse> => {
  const response = await apiPrivate.patch<AddressResponse>(
    `/customer/addresses/${id}/default`
  );

  return response.data;
};
