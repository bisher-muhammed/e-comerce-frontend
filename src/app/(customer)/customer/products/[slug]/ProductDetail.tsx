"use client";

import { useMemo, useState, type ReactNode } from "react";

import type { Product } from "@/app/(customer)/customer/components/products/ProductCard";
import ProductGallery from "@/app/(customer)/customer/components/products/ProductGallery";
import ProductOptions from "@/app/(customer)/customer/components/products/ProductOptions";

interface ProductDetailProps {
  product: Product;
  children: ReactNode;
}

export default function ProductDetail({ product, children }: ProductDetailProps) {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(() => {
    const firstAvailable =
      product.colors.find((color) => color.variants.some((variant) => variant.stock > 0)) ??
      product.colors[0];

    return firstAvailable?.id ?? null;
  });

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const selectedColor =
    product.colors.find((color) => color.id === selectedColorId) ?? product.colors[0];


  const galleryDiscountPercentage = useMemo(() => {
    const pcts = (selectedColor?.variants ?? [])
      .map((v) => v.discountPercentage)
      .filter((pct): pct is number => pct !== null);

    return pcts.length > 0 ? Math.max(...pcts) : null;
  }, [selectedColor]);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <ProductGallery
        images={selectedColor?.images ?? []}
        productName={product.name}
        discountPercentage={galleryDiscountPercentage}
      />

      <div>
        {children}

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
  );
}