"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import apiPrivate from "@/app/lib/api/apiPrivate";

import {
  createAdminSchema,
  type CreateAdminInput,
} from "@/app/validations/admin/admin.validation";


interface AdminFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminForm({
  onClose,
  onSuccess,
}: AdminFormProps) {
  const [serverError, setServerError] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (
    data: CreateAdminInput
  ) => {
    try {
      setServerError(null);

      const response = await apiPrivate.post(
        "/admin/admins",
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }
      );

      console.log(
        "Admin created:",
        response.data
      );

      onSuccess();
    } catch (error: any) {
      console.error(
        "Failed to create admin:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Unable to create administrator.";

      setServerError(message);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/20
        px-4
        py-6
      "
    >
      <div
        className="
          w-full
          max-w-lg
          max-h-[calc(100vh-48px)]
          overflow-y-auto
          border
          border-border
          bg-background
        "
      >
        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-5
            py-4
            sm:px-6
          "
        >
          <div>
            <h2 className="text-lg font-medium">
              Create Admin
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Create an account with admin portal access.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              text-muted-foreground
              hover:bg-secondary
              hover:text-foreground
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-5 sm:p-6"
        >
          {/* Server Error */}

          {serverError && (
            <div
              className="
                border
                border-destructive/20
                bg-destructive/5
                px-3
                py-2.5
                text-sm
                text-destructive
              "
            >
              {serverError}
            </div>
          )}

          

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-sm font-medium"
              >
                First name
              </label>

              <input
                id="firstName"
                type="text"
                placeholder="First name"
                {...register("firstName")}
                className="
                  h-11
                  w-full
                  border
                  border-border
                  bg-background
                  px-3
                  text-sm
                  outline-none
                  focus:border-foreground
                "
              />

              {errors.firstName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-1.5 block text-sm font-medium"
              >
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                {...register("lastName")}
                className="
                  h-11
                  w-full
                  border
                  border-border
                  bg-background
                  px-3
                  text-sm
                  outline-none
                  focus:border-foreground
                "
              />

              {errors.lastName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              {...register("email")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-3
                text-sm
                outline-none
                focus:border-foreground
              "
            />

            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              {...register("password")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-3
                text-sm
                outline-none
                focus:border-foreground
              "
            />

            {errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              {...register("confirmPassword")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-3
                text-sm
                outline-none
                focus:border-foreground
              "
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          

          <div
            className="
              flex
              flex-col-reverse
              gap-2
              border-t
              border-border
              pt-4
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                h-10
                px-4
                text-sm
                font-medium
                text-muted-foreground
                hover:bg-secondary
                hover:text-foreground
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                h-10
                bg-primary
                px-5
                text-sm
                font-medium
                text-primary-foreground
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSubmitting
                ? "Creating..."
                : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}