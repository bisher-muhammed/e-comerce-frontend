"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  addressSchema,
  type AddressFormData,
} from "@/app/validations/customer/address.validation";

import type { Address } from "@/app/services/customer/address.service";

interface AddressFormProps {
  address?: Address | null;
  loading?: boolean;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
}

const ADDRESS_LABELS = [
  { value: "HOME", label: "Home" },
  { value: "OFFICE", label: "Office" },
  { value: "OTHER", label: "Other" },
] as const;

const DEFAULT_VALUES: AddressFormData = {
  label: "HOME",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function AddressForm({
  address,
  loading = false,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const isEditing = Boolean(address);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (address) {
      reset({
        label: address.label,
        firstName: address.firstName,
        lastName: address.lastName ?? "",
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [address, reset]);

  const submit = async (data: AddressFormData) => {
    await onSubmit(data);
  };

  const canSubmit = !loading && (isDirty ? isValid : true);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-medium text-foreground">
          {isEditing ? "Edit address" : "Add new address"}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Fields marked{" "}
          <span className="text-destructive">*</span> are required.
        </p>
      </div>

      {/* ADDRESS TYPE */}
      <fieldset className="space-y-4">
        <SelectField
          label="Address type"
          required
          error={errors.label?.message}
          selectProps={register("label")}
        >
          {ADDRESS_LABELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SelectField>
      </fieldset>

      {/* CONTACT DETAILS */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium tracking-wide text-muted-foreground">
          CONTACT DETAILS
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            required
            error={errors.firstName?.message}
            inputProps={{
              ...register("firstName"),
              placeholder: "First name",
              autoComplete: "given-name",
            }}
          />

          <TextField
            label="Last name"
            error={errors.lastName?.message}
            inputProps={{
              ...register("lastName"),
              placeholder: "Last name",
              autoComplete: "family-name",
            }}
          />
        </div>

        <TextField
          label="Phone"
          required
          error={errors.phone?.message}
          inputProps={{
            ...register("phone"),
            placeholder: "10 digit phone number",
            inputMode: "numeric",
            autoComplete: "tel",
            maxLength: 10,
          }}
        />
      </fieldset>

      {/* DELIVERY ADDRESS */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium tracking-wide text-muted-foreground">
          DELIVERY ADDRESS
        </legend>

        <TextField
          label="Address line 1"
          required
          error={errors.addressLine1?.message}
          inputProps={{
            ...register("addressLine1"),
            placeholder: "House number, street",
            autoComplete: "address-line1",
          }}
        />

        <TextField
          label="Address line 2"
          error={errors.addressLine2?.message}
          inputProps={{
            ...register("addressLine2"),
            placeholder: "Apartment, landmark, etc. (optional)",
            autoComplete: "address-line2",
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="City"
            required
            error={errors.city?.message}
            inputProps={{
              ...register("city"),
              placeholder: "City",
              autoComplete: "address-level2",
            }}
          />

          <TextField
            label="State"
            required
            error={errors.state?.message}
            inputProps={{
              ...register("state"),
              placeholder: "State",
              autoComplete: "address-level1",
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Postal code"
            required
            error={errors.postalCode?.message}
            inputProps={{
              ...register("postalCode"),
              placeholder: "6 digit postal code",
              inputMode: "numeric",
              autoComplete: "postal-code",
              maxLength: 6,
            }}
          />

          <TextField
            label="Country"
            required
            error={errors.country?.message}
            inputProps={{
              ...register("country"),
              autoComplete: "country-name",
            }}
          />
        </div>
      </fieldset>

      {/* ACTIONS */}
      <div className="flex gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className="border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update address"
              : "Save address"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// --------------------------------------------------
// FIELD PRIMITIVES
// --------------------------------------------------

const FIELD_BASE =
  "w-full border bg-input-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50";

const FIELD_BORDER =
  "border-transparent focus:ring-2 focus:ring-ring";

const FIELD_BORDER_ERROR =
  "border-destructive focus:ring-2 focus:ring-destructive";

interface TextFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

function TextField({
  label,
  required,
  error,
  inputProps,
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}

        {required && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
      </label>

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD_BASE} ${
          error ? FIELD_BORDER_ERROR : FIELD_BORDER
        }`}
        {...inputProps}
      />

      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  selectProps: React.SelectHTMLAttributes<HTMLSelectElement>;
  children: React.ReactNode;
}

function SelectField({
  label,
  required,
  error,
  selectProps,
  children,
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="max-w-xs space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}

        {required && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
      </label>

      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${FIELD_BASE} appearance-none pr-9 ${
            error ? FIELD_BORDER_ERROR : FIELD_BORDER
          }`}
          {...selectProps}
        >
          {children}
        </select>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
