"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { getProductBySlug } from "@/app/services/customer/product.service";
import { getApiErrorMessage } from "@/app/lib/api/apiError";
import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";

import ProductGallery from "../../components/products/ProductGallery";
import ProductOptions from "../../components/products/ProductOptions";
import RelatedProducts from "../../components/products/RelatedProducts";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProductBySlug(slug);
        setProduct(data);

        // Default to the first color that actually has stock, falling
        // back to the first color if everything is sold out.
        const firstAvailable =
          data.colors.find((c: Product["colors"][number]) =>
            c.variants.some((v) => v.stock > 0)
          ) ?? data.colors[0];

        setSelectedColorId(firstAvailable?.id ?? null);
        setSelectedVariantId(null);
      } catch (error: unknown) {
        setError(getApiErrorMessage(error, "Unable to load product"));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-3/4 animate-pulse bg-secondary" />
          <div className="flex flex-col gap-4">
            <div className="h-3 w-1/4 animate-pulse bg-secondary" />
            <div className="h-8 w-3/4 animate-pulse bg-secondary" />
            <div className="h-6 w-1/4 animate-pulse bg-secondary" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm text-destructive">
          {error || "Product not found"}
        </p>
      </main>
    );
  }

  const selectedColor =
    product.colors.find((c) => c.id === selectedColorId) ?? product.colors[0];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb */}
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

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery
          images={selectedColor?.images ?? []}
          productName={product.name}
        />

        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-3xl font-medium text-foreground">
            {product.name}
          </h1>

          {selectedColor && (
            <div className="mt-6">
              <ProductOptions
                product={product}
                selectedColorId={selectedColor.id}
                onSelectColor={(colorId) => {
                  setSelectedColorId(colorId);
                  setSelectedVariantId(null);
                }}
                selectedVariantId={selectedVariantId}
                onSelectVariant={setSelectedVariantId}
              />
            </div>
          )}
        </div>
      </div>

      <RelatedProducts
        categoryId={product.category.id}
        excludeProductId={product.id}
      />
    </main>
  );
}