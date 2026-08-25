import Image from "next/image";
import Link from "next/link";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;

  category: {
    id: number;
    name: string;
    slug: string;
  };

  colors: {
    id: number;

    color: {
      id: number;
      name: string;
      slug: string;
      hexCode: string | null;
    };

    images: {
      id: number;
      url: string;
      altText: string | null;
      sortOrder: number;
      isPrimary: boolean;
    }[];

    variants: {
      id: number;
      price: string;
      stock: number;

      size: {
        id: number;
        name: string;
        sortOrder: number;
      };
    }[];
  }[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const productUrl = `/customer/products/${product.slug}`;

  const primaryColor = product.colors[0];

  const images = primaryColor
    ? [...primaryColor.images].sort(
        (a, b) => a.sortOrder - b.sortOrder
      )
    : [];

  const primaryImage =
    images.find((image) => image.isPrimary) ?? images[0];

  const hoverImage = images.find(
    (image) => image.id !== primaryImage?.id
  );

  const prices = product.colors.flatMap((productColor) =>
    productColor.variants.map((variant) =>
      Number(variant.price)
    )
  );

  const lowestPrice =
    prices.length > 0 ? Math.min(...prices) : null;

  const highestPrice =
    prices.length > 0 ? Math.max(...prices) : null;

  const hasRange =
    lowestPrice !== null &&
    highestPrice !== null &&
    lowestPrice !== highestPrice;

  const totalStock = product.colors.reduce(
    (sum, productColor) =>
      sum +
      productColor.variants.reduce(
        (stock, variant) => stock + variant.stock,
        0
      ),
    0
  );

  const isSoldOut = totalStock === 0;
  const isLowStock = !isSoldOut && totalStock <= 3;

  const swatchLimit = 4;

  const visibleColors = product.colors.slice(
    0,
    swatchLimit
  );

  const extraColors =
    product.colors.length - visibleColors.length;

  return (
    <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors duration-200 hover:border-foreground/30">
      {/* Product Image */}
      <Link
        href={productUrl}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-3/4 overflow-hidden bg-secondary">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={
                  primaryImage.altText ?? product.name
                }
                fill
                className={`object-cover transition-all duration-300 ${
                  hoverImage
                    ? "group-hover:opacity-0"
                    : "group-hover:scale-[1.03]"
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt={
                    hoverImage.altText ?? product.name
                  }
                  fill
                  className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}

          {/* Stock Badge */}
          {isSoldOut && (
            <span className="absolute left-3 top-3 border border-border bg-background px-2 py-1 text-xs font-medium uppercase tracking-wide text-foreground">
              Sold out
            </span>
          )}

          {isLowStock && (
            <span className="absolute left-3 top-3 border border-border bg-background px-2 py-1 text-xs font-medium uppercase tracking-wide text-destructive">
              Only {totalStock} left
            </span>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Category */}
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category.name}
        </p>

        {/* Product Name */}
        <Link
          href={productUrl}
          className="group/name"
        >
          <h2 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover/name:underline">
            {product.name}
          </h2>
        </Link>

        {/* Colors */}
        {visibleColors.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            {visibleColors.map((productColor) => (
              <span
                key={productColor.id}
                title={productColor.color.name}
                className="h-3.5 w-3.5 border border-border"
                style={{
                  backgroundColor:
                    productColor.color.hexCode ??
                    "#EDECE8",
                }}
              />
            ))}

            {extraColors > 0 && (
              <span className="text-xs text-muted-foreground">
                +{extraColors}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          {lowestPrice !== null ? (
            <p className="text-sm font-semibold text-foreground">
              {hasRange && (
                <span className="mr-1 font-normal text-muted-foreground">
                  From
                </span>
              )}
              ₹{lowestPrice.toFixed(2)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Price unavailable
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
