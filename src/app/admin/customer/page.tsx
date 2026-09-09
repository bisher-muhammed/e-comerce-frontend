"use client";

import { useEffect, useState } from "react";

import {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  type Customer,
  type CustomerPagination,
  type CustomerStatus,
} from "@/app/services/admin/user.service";

import CustomerList from "./component/CustomerList";
import CustomerDetails from "./component/CustomerDetails";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [pagination, setPagination] =
    useState<CustomerPagination | null>(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Keep the last-used filters so a status update can refetch
  // the same page/search/status instead of resetting to defaults.
  const [lastQuery, setLastQuery] = useState<{
    page: number;
    limit: number;
    search?: string;
    status?: CustomerStatus;
  }>({ page: 1, limit: 10 });

  // Fetch customers
  const fetchCustomers = async (
    page = 1,
    limit = 10,
    search = "",
    status?: Customer["status"]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCustomers({
        page,
        limit,
        search: search || undefined,
        status,
      });

      setCustomers(response.data.customers);
      setPagination(response.data.pagination);
      setLastQuery({ page, limit, search: search || undefined, status });
    } catch (error) {
      console.error(error);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  // Initial customer fetch
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch selected customer details
  const handleSelectCustomer = async (id: number) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);

      const response = await getCustomerById(id);

      setSelectedCustomer(response.data);
    } catch (error) {
      console.error(error);
      setDetailsError("Failed to load customer details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Activate / deactivate a customer, then refetch the current
  // page/filters (not a hard reset to page 1 / no filters).
  const handleUpdateStatus = async (id: number, status: CustomerStatus) => {
    await updateCustomerStatus(id, status);

    await fetchCustomers(
      lastQuery.page,
      lastQuery.limit,
      lastQuery.search,
      lastQuery.status
    );

    if (selectedCustomer?.id === id) {
      const refreshed = await getCustomerById(id);
      setSelectedCustomer(refreshed.data);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading customers...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Manage your customers
        </p>
      </div>

      <CustomerList
        customers={customers}
        pagination={pagination}
        onSelectCustomer={handleSelectCustomer}
        onSearch={fetchCustomers}
        onStatusChange={handleUpdateStatus}
      />

      {detailsLoading && (
        <div className="text-sm text-muted-foreground">
          Loading customer details...
        </div>
      )}

      {detailsError && (
        <div className="text-sm text-red-500">{detailsError}</div>
      )}

      {selectedCustomer && !detailsLoading && (
        <CustomerDetails
          customer={selectedCustomer}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </div>
  );
}
