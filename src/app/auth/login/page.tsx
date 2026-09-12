"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import apiPublic from "@/app/lib/api/apiPublic";
import { applyServerErrors } from "@/app/lib/api/formErrors";
import {
  loginSchema,
  type LoginInput,
} from "@/app/validations/customer/auth.validation";

const FORM_FIELDS = [
  "email",
  "password",
] as const;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginInput) => {
  try {
    await apiPublic.post(
      "/auth/login",
      data
    );

    router.replace("/customer");
  } catch (error) {
    applyServerErrors(
      error,
      setError,
      FORM_FIELDS,
      "Unable to log in. Please try again."
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
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Log in to your account to continue.
          </p>
        </div>

        {/* Login Form */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
            space-y-4

            max-[900px]:space-y-3
            min-[901px]:max-[1200px]:space-y-3
            min-[1201px]:max-[1400px]:space-y-3
          "
        >
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
            <div className="mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                Password
              </label>
            </div>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
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

          {/* Server Error */}

          {errors.root && (
            <p
              role="alert"
              className="
                text-center
                text-sm
                text-destructive
              "
            >
              {errors.root.message}
            </p>
          )}

          {/* Submit */}

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
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Register */}

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
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="
              font-medium
              text-foreground
              underline
              underline-offset-4
            "
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
