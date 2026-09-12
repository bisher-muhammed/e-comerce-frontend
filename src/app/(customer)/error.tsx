"use client";

import ErrorState from "@/app/components/feedback/ErrorState";

export default function CustomerError({
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
      description="We could not load this part of the store. Trying again usually helps."
    />
  );
}
