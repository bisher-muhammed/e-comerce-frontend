"use client";

import { useEffect, useState } from "react";
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
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to the first image whenever the image set changes (i.e. color switch)
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-3/4 items-center justify-center bg-secondary text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  const goPrev = () =>
    setActiveIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  const goNext = () =>
    setActiveIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));

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
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-3/4 overflow-hidden border transition-colors ${
                index === activeIndex
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