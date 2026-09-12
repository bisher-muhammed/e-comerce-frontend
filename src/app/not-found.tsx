import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-6 py-20 text-foreground">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The page you are looking for does not exist or has been
          moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/customer"
            className="inline-flex h-11 items-center justify-center bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue shopping
          </Link>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
