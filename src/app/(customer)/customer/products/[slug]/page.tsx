import type { Metadata } from "next";
import Link from "next/link";
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

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let product: Product | null;

  try {
    product = await getProductBySlugServer(slug);
  } catch {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm text-destructive">Unable to load product</p>
      </main>
    );
  }

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

      <RelatedProducts
        categoryId={product.category.id}
        excludeProductId={product.id}
      />
    </main>
  );
}
