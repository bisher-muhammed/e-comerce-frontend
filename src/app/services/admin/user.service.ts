import apiPrivate from "@/app/lib/api/apiPrivate"

export type CustomerStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  role: "CUSTOMER";
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerListResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: CustomerPagination;
  };
}

export interface GetCustomerResponse {
  success: boolean;
  data: Customer;
}

export interface UpdateCustomerStatusResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface ListCustomersParams {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}

export const getCustomers = async (
  params?: ListCustomersParams
): Promise<CustomerListResponse> => {
  const response = await apiPrivate.get<CustomerListResponse>(
    "/admin/customers",
    {
      params,
    }
  );

  return response.data;
};


export const getCustomerById = async (
  id: number
): Promise<GetCustomerResponse> => {
  const response = await apiPrivate.get<GetCustomerResponse>(
    `/admin/customers/${id}`
  );

  return response.data;
};


export const updateCustomerStatus = async (
  id: number,
  status: CustomerStatus
): Promise<UpdateCustomerStatusResponse> => {
  const response =
    await apiPrivate.patch<UpdateCustomerStatusResponse>(
      `/admin/customers/${id}/status`,
      {
        status,
      }
    );

  return response.data;
};
