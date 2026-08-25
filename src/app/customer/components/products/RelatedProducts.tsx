"use client";

import { useEffect, useState } from "react";
import ProductCard, { type Product } from "@/app/customer/components/products/ProductCard";
import { getProducts } from "@/app/services/customer/product.service";

interface RelatedProductsProps {
  categoryId: number;
  excludeProductId: number;
}

export default function RelatedProducts({
  categoryId,
  excludeProductId,
}: RelatedProductsProps) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        const filtered = data.data
          .filter(
            (p: Product) =>
              p.category.id === categoryId && p.id !== excludeProductId
          )
          .slice(0, 4);
        setRelated(filtered);
      } catch {
        // Related products are a nice-to-have — fail silently rather
        // than blocking the page with an error state.
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categoryId, excludeProductId]);

  if (loading || related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Complete the look
      </p>
      <h2 className="mt-1 text-2xl font-medium text-foreground">
        You may also like
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}