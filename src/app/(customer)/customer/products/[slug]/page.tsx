import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";
import { getProductBySlugServer } from "@/app/services/customer/product.server";
import { SITE_NAME, toMetaDescription } from "@/app/lib/seo/site";

import RelatedProducts from "../../components/products/RelatedProducts";
import ProductDetail from "./ProductDetail";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const getPrimaryImage = (product: Product) => {
  for (const color of product.colors) {
    const images = [...color.images].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    const image = images.find((item) => item.isPrimary) ?? images[0];

    if (image) {
      return image;
    }
  }

  return null;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  let product: Product | null;

  try {
    product = await getProductBySlugServer(slug);
  } catch {
    return { title: "Product" };
  }

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: true },
    };
  }

  const description = toMetaDescription(
    product.description,
    `${product.name} — ${product.category.name} at ${SITE_NAME}.`
  );

  const canonical = `/customer/products/${product.slug}`;
  const image = getPrimaryImage(product);

  return {
    title: product.name,
    description,

    alternates: { canonical },

    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: product.name,
      description,
      url: canonical,
      images: image
        ? [{ url: image.url, alt: image.altText ?? product.name }]
        : undefined,
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

function RelatedProductsSkeleton() {
  return (
    <section
      className="mt-16 border-t border-border pt-10"
      aria-hidden="true"
    >
      <div className="h-3 w-32 animate-pulse bg-secondary" />
      <div className="mt-3 h-7 w-56 animate-pulse bg-secondary" />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex flex-col border border-border bg-card"
          >
            <div className="aspect-3/4 animate-pulse bg-secondary" />

            <div className="flex flex-col gap-2 p-4">
              <div className="h-3 w-1/3 animate-pulse bg-secondary" />
              <div className="h-4 w-3/4 animate-pulse bg-secondary" />
              <div className="mt-2 h-4 w-1/4 animate-pulse bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product: Product | null = await getProductBySlugServer(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/customer" className="hover:text-foreground">
          Shop
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.category.name}</span>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail product={product}>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          {product.category.name}
        </p>

        <h1 className="mt-2 text-3xl font-medium text-foreground">
          {product.name}
        </h1>
      </ProductDetail>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          categoryId={product.category.id}
          excludeProductId={product.id}
        />
      </Suspense>
    </main>
  );
}
