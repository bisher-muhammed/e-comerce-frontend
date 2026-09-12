import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product not found",
  robots: { index: false, follow: true },
};

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6 py-20">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-tight">
          Product not found
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          This product is no longer available or the link is
          incorrect.
        </p>

        <div className="mt-8">
          <Link
            href="/customer"
            className="inline-flex h-11 items-center justify-center bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Browse all products
          </Link>
        </div>
      </div>
    </main>
  );
}
