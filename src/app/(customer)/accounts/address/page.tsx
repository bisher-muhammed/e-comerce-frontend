"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import AddressCard from "./components/AddressCard";
import AddressForm from "./components/AddressForm";
import type { Address } from "@/app/services/customer/address.service";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/services/customer/address.service";

import type { AddressFormData } from "@/app/validations/customer/address.validation";
import { getApiErrorMessage } from "@/app/lib/api/apiError";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { useConfirm } from "@/app/components/feedback/ConfirmProvider";

// Render this inside AccountLayout, e.g.:
//   <AccountLayout user={user}><AddressesPage /></AccountLayout>
// It intentionally does NOT render <main>, the sidebar, or the user header —
// that's AccountLayout's job, so Orders/Profile can reuse it too.
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAddresses();
      setAddresses(response.data);
    } catch (error) {
      setError(getApiErrorMessage(error, "Unable to load addresses"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (data: AddressFormData) => {
    try {
      setSaving(true);
      setError("");

      const response = await createAddress(data);

      setAddresses((prev) =>
        response.data.isDefault
          ? [...prev.map((a) => ({ ...a, isDefault: false })), response.data]
          : [...prev, response.data]
      );

      setShowForm(false);
      setEditingAddress(null);

      toast.success("Address added.");
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: AddressFormData) => {
    if (!editingAddress) return;

    try {
      setSaving(true);
      setError("");

      const response = await updateAddress(editingAddress.id, data);

      setAddresses((prev) =>
        response.data.isDefault
          ? prev.map((a) => ({ ...a, isDefault: a.id === response.data.id }))
          : prev.map((a) => (a.id === response.data.id ? response.data : a))
      );

      setShowForm(false);
      setEditingAddress(null);

      toast.success("Address updated.");
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Delete this address?",
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");
      await deleteAddress(id);

      const response = await getAddresses();
      setAddresses(response.data);

      toast.success("Address deleted.");
    } catch (error) {
      setError(getApiErrorMessage(error, "Unable to delete address"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setActionLoading(id);
      setError("");

      const response = await setDefaultAddress(id);

      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === response.data.id }))
      );

      toast.success("Default address updated.");
    } catch (error) {
      setError(getApiErrorMessage(error, "Unable to set default address"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
    setError("");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setError("");
  };

  const openNewForm = () => {
    setEditingAddress(null);
    setShowForm(true);
    setError("");
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-7 w-40 animate-pulse bg-secondary" />
          <div className="mt-2 h-4 w-64 animate-pulse bg-secondary" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse border border-border bg-secondary"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Saved addresses
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {addresses.length}{" "}
            {addresses.length === 1 ? "address" : "addresses"} saved
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Add address
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <section className="mb-8 border border-border bg-card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground">
              {editingAddress ? "Edit address" : "Add new address"}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Enter your delivery details below.
            </p>
          </div>

          <AddressForm
            address={editingAddress}
            onSubmit={editingAddress ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={saving}
          />
        </section>
      )}

      {!showForm && (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              loading={actionLoading === address.id}
            />
          ))}

          <button
            type="button"
            onClick={openNewForm}
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-current">
              <Plus size={16} />
            </span>
            Add new address
          </button>
        </div>
      )}
    </div>
  );
}
