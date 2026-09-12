"use client";

import ErrorState from "@/app/components/feedback/ErrorState";

export default function AdminError({
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
      description="This admin screen failed to render. Trying again usually helps."
      homeHref="/admin/dashboard"
      homeLabel="Back to dashboard"
    />
  );
}
