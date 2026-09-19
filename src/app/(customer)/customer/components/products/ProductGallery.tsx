"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  discountPercentage?: number | null;
}

export default function ProductGallery({
  images,
  productName,
  discountPercentage,
}: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = Math.min(
    activeIndex,
    Math.max(sorted.length - 1, 0)
  );
  const active = sorted[safeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-3/4 items-center justify-center bg-secondary text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  const goPrev = () =>
    setActiveIndex(
      safeIndex === 0 ? sorted.length - 1 : safeIndex - 1
    );
  const goNext = () =>
    setActiveIndex(
      safeIndex === sorted.length - 1 ? 0 : safeIndex + 1
    );

  const hasDiscount = discountPercentage != null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-3/4 overflow-hidden bg-secondary">
        <Image
          key={active.id}
          src={active.url}
          alt={active.altText ?? productName}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {hasDiscount && (
          <span className="absolute left-3 top-3 z-10 border border-green-700 bg-green-700 px-2 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
            {discountPercentage}% OFF
          </span>
        )}

        {sorted.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground transition-colors hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground transition-colors hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={index === safeIndex}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-3/4 overflow-hidden border transition-colors ${
                index === safeIndex
                  ? "border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText ?? productName}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
