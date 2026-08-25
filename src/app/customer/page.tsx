"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import ProductCard, { type Product } from "./components/products/ProductCard";
import { getProducts } from "../services/customer/product.service";
import { getApiErrorMessage } from "../lib/api/apiError";

// ---------- Hero banner (static promo content) ----------

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

// ---------- Promo strip (static promo content) ----------

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

// ---------- Skeleton ----------

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

// ---------- Page ----------

export default function CustomerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();
      setProducts(data.data);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Unable to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <HeroBanner />
        <PromoStrip />
      </div>

      <div id="products" className="mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-8 flex flex-col gap-1 border-b border-border pb-6">
          <h2 className="text-2xl font-medium text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading the latest collection..."
              : `${products.length} item${products.length === 1 ? "" : "s"} available`}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-start gap-3 border border-border bg-card p-6">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={loadProducts}
              className="border border-foreground px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="border border-border bg-card px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No products available right now. Check back soon.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
