
"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductCard, {
  type Product,
} from "./components/products/ProductCard";

import {
  getProducts,
  type ProductPagination,
} from "@/app/services/customer/product.service";

import { getWishlist } from "@/app/services/customer/wishlist.service";

import {
  getAvailableCoupons,
  claimCoupon,
  type CustomerCoupon,
} from "@/app/services/customer/coupon.service";

import { getApiErrorMessage } from "@/app/lib/api/apiError";

import CouponCard from "@/app/(customer)/coupon/component/CouponCard";

const PRODUCTS_PER_PAGE = 12;

// ============================================================
// HERO BANNER
// ============================================================

function HeroBanner() {
  return (
    <section className="relative mb-10 aspect-16/7 w-full overflow-hidden border border-border sm:aspect-21/9">
      <Image
        src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80"
        alt="New season arrivals"
        fill
        priority
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

// ============================================================
// PROMO STRIP
// ============================================================

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

// ============================================================
// PRODUCT SKELETON
// ============================================================

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

// ============================================================
// COUPON SKELETON
// ============================================================

function CouponCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="h-20 animate-pulse bg-secondary" />

      <div className="space-y-4 p-5">
        <div className="h-7 w-32 animate-pulse rounded bg-secondary" />

        <div className="h-12 animate-pulse rounded-lg bg-secondary" />

        <div className="h-10 animate-pulse rounded-lg bg-secondary" />
      </div>
    </div>
  );
}

// ============================================================
// COUPON SECTION
// ============================================================

interface CouponSectionProps {
  coupons: CustomerCoupon[];
  claimingCode: string | null;
  onClaim: (coupon: CustomerCoupon) => Promise<void>;
}

function CouponSection({
  coupons,
  claimingCode,
  onClaim,
}: CouponSectionProps) {
  if (coupons.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12">
      {/* HEADER */}

      <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Coupons & Offers
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Claim an offer and save on your next order.
          </p>
        </div>

        <Link
          href="/coupon"
          className="hidden items-center gap-1 text-xs font-medium text-foreground transition-opacity hover:opacity-60 sm:flex"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* COUPONS */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.slice(0, 3).map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            claiming={claimingCode === coupon.code}
            onClaim={onClaim}
          />
        ))}
      </div>

      {/* MOBILE VIEW ALL */}

      <div className="mt-6 sm:hidden">
        <Link
          href="/coupon"
          className="flex items-center justify-center gap-1 border border-border px-4 py-3 text-xs font-medium transition-colors hover:border-foreground"
        >
          View all coupons
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function CustomerPage() {
  // ============================================================
  // PRODUCT STATE
  // ============================================================

  const [products, setProducts] = useState<Product[]>([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<ProductPagination | null>(null);

  const [wishlistProductIds, setWishlistProductIds] =
    useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // COUPON STATE
  // ============================================================

  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);

  const [couponLoading, setCouponLoading] = useState(true);

  const [couponError, setCouponError] = useState("");

  const [claimingCode, setClaimingCode] =
    useState<string | null>(null);

  // ============================================================
  // LOAD PRODUCTS + WISHLIST
  // ============================================================

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Products are required.
       *
       * Wishlist is optional because a guest user
       * may not be authenticated.
       */

      const productsResponse = await getProducts({
        page,
        limit: PRODUCTS_PER_PAGE,
      });

      setProducts(productsResponse.data);

      setPagination(
        productsResponse.pagination ?? null
      );

      // Try loading wishlist separately.
      try {
        const wishlistResponse = await getWishlist();

        const wishlistIds =
          wishlistResponse.data?.items.map(
            (item) => item.productId
          ) ?? [];

        setWishlistProductIds(
          new Set(wishlistIds)
        );
      } catch {
        /*
         * Guest user / authentication error.
         *
         * Don't show an error for this.
         */

        setWishlistProductIds(new Set());
      }
    } catch (error: unknown) {
      setError(
        getApiErrorMessage(
          error,
          "Unable to load products"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  // ============================================================
  // LOAD COUPONS
  // ============================================================

  const loadCoupons = useCallback(async () => {
    try {
      setCouponLoading(true);
      setCouponError("");

      const data = await getAvailableCoupons();

      setCoupons(data);
    } catch (error: unknown) {
      /*
       * Coupon section is not critical to the home page.
       *
       * If coupon loading fails, don't prevent
       * products from being displayed.
       */

      setCouponError(
        getApiErrorMessage(
          error,
          "Unable to load coupons"
        )
      );

      setCoupons([]);
    } finally {
      setCouponLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // ============================================================
  // PAGE CHANGE
  // ============================================================

  const goToPage = (nextPage: number) => {
    setPage(nextPage);

    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // ============================================================
  // CLAIM COUPON
  // ============================================================

  const handleClaimCoupon = async (
    coupon: CustomerCoupon
  ) => {
    try {
      setClaimingCode(coupon.code);
      setCouponError("");

      await claimCoupon(coupon.code);

      /*
       * Reload coupons so the card changes
       * from "Claim coupon" to "Claimed".
       */

      await loadCoupons();
    } catch (error: unknown) {
      setCouponError(
        getApiErrorMessage(
          error,
          "Unable to claim coupon"
        )
      );
    } finally {
      setClaimingCode(null);
    }
  };

  // ============================================================
  // WISHLIST CHANGE
  // ============================================================

  const handleWishlistChange = (
    productId: number,
    isWishlisted: boolean
  ) => {
    setWishlistProductIds((previous) => {
      const next = new Set(previous);

      if (isWishlisted) {
        next.add(productId);
      } else {
        next.delete(productId);
      }

      return next;
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-background">
      {/* ====================================================== */}
      {/* HERO + PROMO */}
      {/* ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-10">
        <HeroBanner />

        <PromoStrip />
      </div>

      {/* ====================================================== */}
      {/* PRODUCTS */}
      {/* ====================================================== */}

      <div
        id="products"
        className="mx-auto max-w-7xl px-6 pb-10"
      >
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-1 border-b border-border pb-6">
          <h2 className="text-2xl font-medium text-foreground">
            Products
          </h2>

          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading the latest collection..."
              : `${
                  pagination?.total ??
                  products.length
                } item${
                  (pagination?.total ??
                    products.length) === 1
                    ? ""
                    : "s"
                } available`}
          </p>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, i) => (
                <ProductCardSkeleton key={i} />
              )
            )}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="flex flex-col items-start gap-3 border border-border bg-card p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <button
              onClick={loadProducts}
              className="border border-foreground px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
            >
              Try again
            </button>
          </div>
        )}

        {/* NO PRODUCTS */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="border border-border bg-card px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No products available right now.
                Check back soon.
              </p>
            </div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistProductIds.has(
                    product.id
                  )}
                  onWishlistChange={
                    handleWishlistChange
                  }
                />
              ))}
            </div>
          )}

        {/* PAGINATION */}

        {!loading &&
          !error &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  goToPage(pagination.page - 1)
                }
                className="border border-foreground px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                Previous
              </button>

              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  goToPage(pagination.page + 1)
                }
                className="border border-foreground px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                Next
              </button>
            </div>
          )}
      </div>

      {/* ====================================================== */}
      {/* COUPONS */}
      {/* ====================================================== */}

      {!couponLoading && !couponError && (
        <CouponSection
          coupons={coupons}
          claimingCode={claimingCode}
          onClaim={handleClaimCoupon}
        />
      )}

      {/* COUPON LOADING */}

      {couponLoading && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="mb-6 border-b border-border pb-5">
            <div className="h-6 w-48 animate-pulse rounded bg-secondary" />

            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-secondary" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <CouponCardSkeleton key={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
