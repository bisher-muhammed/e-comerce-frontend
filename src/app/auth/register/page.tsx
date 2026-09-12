"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import apiPublic from "@/app/lib/api/apiPublic";
import { applyServerErrors } from "@/app/lib/api/formErrors";
import {
  registerSchema,
  type RegisterInput,
} from "../../validations/customer/auth.validation";

const FORM_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "password",
  "confirmPassword",
] as const;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const { confirmPassword, ...registrationData } = data;

      await apiPublic.post("/auth/register", registrationData);

      router.push("/auth/verify-otp");
    } catch (error) {
      applyServerErrors(
        error,
        setError,
        FORM_FIELDS,
        "Unable to create your account."
      );
    }
  };

  return (
    <main
      className="
        min-h-screen
        bg-background
        px-4
        py-8
        sm:px-6
        sm:py-10
        lg:py-12

        max-[900px]:py-6
        min-[901px]:max-[1200px]:py-6
        min-[1201px]:max-[1400px]:py-6
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-md
        "
      >
        {/* Header */}
        <div
          className="
            mb-6
            text-center
            sm:mb-7

            max-[900px]:mb-5
            min-[901px]:max-[1200px]:mb-5
            min-[1201px]:max-[1400px]:mb-5
          "
        >
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            STORE.
          </Link>

          <h1
            className="
              mt-5
              text-2xl
              font-medium
              tracking-tight
              sm:mt-6
              sm:text-3xl

              max-[900px]:mt-4
              min-[901px]:max-[1200px]:mt-4
              min-[1201px]:max-[1400px]:mt-4
            "
          >
            Create your account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your details to get started.
          </p>
        </div>

        {/* Register Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
            space-y-4

            max-[900px]:space-y-3
            min-[901px]:max-[1200px]:space-y-3
            min-[1201px]:max-[1400px]:space-y-3
          "
        >
          {/* First Name */}
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
                px-4
                text-sm
                outline-none
                transition
                focus:border-foreground
                sm:h-12
              "
            />

            {errors.firstName && (
              <p className="mt-1.5 text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
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
                px-4
                text-sm
                outline-none
                transition
                focus:border-foreground
                sm:h-12
              "
            />

            {errors.lastName && (
              <p className="mt-1.5 text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
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
              placeholder="you@example.com"
              {...register("email")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-4
                text-sm
                outline-none
                transition
                focus:border-foreground
                sm:h-12
              "
            />

            {errors.email && (
              <p className="mt-1.5 text-sm text-destructive">
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
              placeholder="Create a password"
              {...register("password")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-4
                text-sm
                outline-none
                transition
                focus:border-foreground
                sm:h-12
              "
            />

            {errors.password && (
              <p className="mt-1.5 text-sm text-destructive">
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
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className="
                h-11
                w-full
                border
                border-border
                bg-background
                px-4
                text-sm
                outline-none
                transition
                focus:border-foreground
                sm:h-12
              "
            />

            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Server Error */}
          {errors.root && (
            <p
              role="alert"
              className="text-center text-sm text-destructive"
            >
              {errors.root.message}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              h-11
              w-full
              bg-primary
              text-sm
              font-medium
              text-primary-foreground
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:h-12
            "
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Login Link */}
        <p
          className="
            mt-6
            text-center
            text-sm
            text-muted-foreground

            max-[900px]:mt-4
            min-[901px]:max-[1200px]:mt-4
            min-[1201px]:max-[1400px]:mt-4
          "
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
