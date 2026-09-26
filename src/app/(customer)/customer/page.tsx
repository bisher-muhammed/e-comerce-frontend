import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import ProductCard from "./components/products/ProductCard";
import HomeCoupons from "./components/HomeCoupons";

import { getProductsServer } from "@/app/services/customer/product.server";

const PRODUCTS_PER_PAGE = 12;

interface CustomerPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

const parsePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

function HeroBanner() {
  return (
    <section className="relative mb-10 aspect-16/7 w-full overflow-hidden border border-border sm:aspect-21/9">
      <Image
        src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80"
        alt="New season arrivals"
        fill
        priority
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-t from-[#1A1917]/80 via-[#1A1917]/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-10">
        <p className="text-xs uppercase tracking-widest text-[#F9F8F6]/80">
          New season
        </p>

        <h1 className="max-w-md text-2xl font-medium text-[#F9F8F6] sm:text-3xl">
          Tailored essentials, made to last
        </h1>

        <a
          href="#products"
          className="mt-2 inline-flex w-fit items-center border border-[#F9F8F6] bg-[#F9F8F6] px-5 py-2.5 text-sm font-medium text-[#1A1917] transition-colors hover:bg-transparent hover:text-[#F9F8F6]"
        >
          Shop the collection
        </a>
      </div>
    </section>
  );
}

const promos = [
  {
    label: "New arrivals",
    href: "#products",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80",
  },
  {
    label: "Formal edit",
    href: "#products",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80",
  },
];

function PromoStrip() {
  return (
    <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {promos.map((promo) => (
        <a
          key={promo.label}
          href={promo.href}
          className="group relative aspect-video overflow-hidden border border-border"
        >
          <Image
            src={promo.image}
            alt={promo.label}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-[#1A1917]/30 transition-colors group-hover:bg-[#1A1917]/40" />

          <span className="absolute bottom-4 left-4 border border-[#F9F8F6] bg-[#F9F8F6]/10 px-3 py-1.5 text-sm font-medium text-[#F9F8F6] backdrop-blur-sm">
            {promo.label}
          </span>
        </a>
      ))}
    </section>
  );
}

const PAGE_LINK_CLASSES =
  "border border-foreground px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground";

const PAGE_LINK_DISABLED_CLASSES =
  "cursor-not-allowed border border-border px-4 py-2 text-sm font-medium text-muted-foreground";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col border border-border bg-card">
      <div className="aspect-3/4 animate-pulse bg-secondary" />

      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-1/3 animate-pulse bg-secondary" />
        <div className="h-4 w-3/4 animate-pulse bg-secondary" />
        <div className="mt-2 h-4 w-1/4 animate-pulse bg-secondary" />
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div role="status" aria-label="Loading products">
      <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6">
        <div className="h-7 w-40 animate-pulse bg-secondary" />
        <div className="h-4 w-56 animate-pulse bg-secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>

      <span className="sr-only">Loading products…</span>
    </div>
  );
}

function ProductGridUnavailable({ page }: { page: number }) {
  return (
    <div
      role="alert"
      className="border border-border bg-card px-6 py-16 text-center"
    >
      <p className="text-sm text-muted-foreground">
        Products couldn&apos;t be loaded right now.
      </p>

      <Link
        href={`/customer?page=${page}#products`}
        className={`mt-5 inline-block ${PAGE_LINK_CLASSES}`}
      >
        Try again
      </Link>
    </div>
  );
}

async function ProductGrid({ page }: { page: number }) {
  let result: Awaited<ReturnType<typeof getProductsServer>>;

  try {
    result = await getProductsServer(page, PRODUCTS_PER_PAGE);
  } catch (error) {
    console.error("Failed to load products", error);

    return <ProductGridUnavailable page={page} />;
  }

  const { products, pagination } = result;

  const total = pagination?.total ?? products.length;
  const currentPage = pagination?.page ?? page;

  return (
    <>
      <div className="mb-8 flex flex-col gap-1 border-b border-border pb-6">
        <h2 className="text-2xl font-medium text-foreground">
          Products
        </h2>

        <p className="text-sm text-muted-foreground">
          {total} item{total === 1 ? "" : "s"} available
        </p>
      </div>

      {products.length === 0 ? (
        <div className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No products available right now. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Product pagination"
          className="mt-10 flex items-center justify-between border-t border-border pt-6"
        >
          {pagination.hasPreviousPage ? (
            <Link
              href={`/customer?page=${currentPage - 1}#products`}
              className={PAGE_LINK_CLASSES}
              rel="prev"
            >
              Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={PAGE_LINK_DISABLED_CLASSES}
            >
              Previous
            </span>
          )}

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.totalPages}
          </span>

          {pagination.hasNextPage ? (
            <Link
              href={`/customer?page=${currentPage + 1}#products`}
              className={PAGE_LINK_CLASSES}
              rel="next"
            >
              Next
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={PAGE_LINK_DISABLED_CLASSES}
            >
              Next
            </span>
          )}
        </nav>
      )}
    </>
  );
}

export default async function CustomerPage({
  searchParams,
}: CustomerPageProps) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <HeroBanner />

        <PromoStrip />
      </div>

      <div id="products" className="mx-auto max-w-7xl px-6 pb-10">
        <Suspense key={page} fallback={<ProductGridSkeleton />}>
          <ProductGrid page={page} />
        </Suspense>
      </div>

      <HomeCoupons />
    </div>
  );
}
