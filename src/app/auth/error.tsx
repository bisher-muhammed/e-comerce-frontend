"use client";

import ErrorState from "@/app/components/feedback/ErrorState";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      description="We could not load this page. Trying again usually helps."
      homeHref="/auth/login"
      homeLabel="Back to sign in"
    />
  );
}
