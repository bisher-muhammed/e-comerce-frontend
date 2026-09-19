"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

export default function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "We could not load this page. Trying again usually helps.",
  homeHref = "/customer",
  homeLabel = "Continue shopping",
}: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-background px-6 py-20 text-foreground">
      <div className="w-full max-w-md text-center">
        <AlertTriangle
          className="mx-auto h-10 w-10 text-destructive"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        <h1 className="mt-6 text-2xl font-medium tracking-tight sm:text-3xl">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>

          <Link
            href={homeHref}
            className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium transition-colors hover:bg-secondary"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
