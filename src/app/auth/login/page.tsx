"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import apiPublic from "@/app/lib/api/apiPublic";
import { refreshSession } from "@/app/lib/api/apiPrivate";
import { applyServerErrors } from "@/app/lib/api/formErrors";
import { hasSessionHint, safeNextPath } from "@/app/lib/auth/session";
import { CUSTOMER_STORAGE_PREFIX } from "@/app/lib/session/clientSessionData";
import {
  classifySessionError,
  fetchCurrentUser,
} from "@/app/hooks/useCurrentUser";
import {
  loginSchema,
  type LoginInput,
} from "@/app/validations/customer/auth.validation";

const FORM_FIELDS = [
  "email",
  "password",
] as const;

const DEFAULT_DESTINATION = "/customer";

const RESUME_GUARD_KEY = `${CUSTOMER_STORAGE_PREFIX}auth:resumed`;
const RESUME_GUARD_WINDOW_MS = 30_000;

function recentlyResumedTo(destination: string): boolean {
  try {
    const raw = window.sessionStorage.getItem(RESUME_GUARD_KEY);
    const last = raw ? JSON.parse(raw) : null;

    return (
      last?.destination === destination &&
      Date.now() - Number(last.at) < RESUME_GUARD_WINDOW_MS
    );
  } catch {
    return false;
  }
}

function rememberResume(destination: string) {
  try {
    window.sessionStorage.setItem(
      RESUME_GUARD_KEY,
      JSON.stringify({ destination, at: Date.now() })
    );
  } catch {}
}

async function resumeExistingSession(): Promise<boolean> {
  try {
    await fetchCurrentUser();
    return true;
  } catch (error) {
    if (classifySessionError(error) !== "guest") return false;
  }

  if (hasSessionHint()) return false;

  if ((await refreshSession()) !== "refreshed") return false;

  try {
    await fetchCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination =
    safeNextPath(searchParams.get("next")) ?? DEFAULT_DESTINATION;

  const [resuming, setResuming] = useState(true);
  const [sessionNotKept, setSessionNotKept] = useState(false);

  useEffect(() => {
    let cancelled = false;

    resumeExistingSession().then((resumed) => {
      if (cancelled) return;

      if (resumed && !recentlyResumedTo(destination)) {
        rememberResume(destination);
        router.replace(destination);
        return;
      }

      setSessionNotKept(resumed);
      setResuming(false);
    });

    return () => {
      cancelled = true;
    };
  }, [destination, router]);

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

    router.replace(destination);
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

          {sessionNotKept && (
            <p
              role="status"
              className="text-center text-sm text-muted-foreground"
            >
              You&apos;re signed in, but this page couldn&apos;t confirm
              your session. Please sign in again; if this keeps
              happening, allow cookies for this site.
            </p>
          )}

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
            disabled={isSubmitting || resuming}
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
            {resuming
              ? "Checking your session..."
              : isSubmitting
                ? "Logging in..."
                : "Log in"}
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
