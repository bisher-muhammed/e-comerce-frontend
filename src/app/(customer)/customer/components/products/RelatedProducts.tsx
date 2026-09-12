import ProductCard from "@/app/(customer)/customer/components/products/ProductCard";
import { getProductsServer } from "@/app/services/customer/product.server";

interface RelatedProductsProps {
  categoryId: number;
  excludeProductId: number;
}

export default async function RelatedProducts({
  categoryId,
  excludeProductId,
}: RelatedProductsProps) {
  let related;

  try {
    const { products } = await getProductsServer(1, 5, categoryId);

    related = products
      .filter((product) => product.id !== excludeProductId)
      .slice(0, 4);
  } catch {
    return null;
  }

  if (related.length === 0) {
    return null;
  }

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
