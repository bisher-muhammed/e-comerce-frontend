import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import HeroCarousel from "@/app/auth/components/HeroCarousel";
import { SITE_DESCRIPTION, SITE_NAME } from "@/app/lib/seo/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Shirts, Streetwear & Everyday Essentials`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};


const categories = [
  {
    name: "New Arrivals",
    description: "Freshly dropped cuts, seasonal fabrics, and trending patterns.",
    image: "/photos/WhatsApp Image 2026-08-19 at 19.39.19.jpeg",
  },
  {
    name: "Casual Wear",
    description: "Relaxed button-downs, breathable linens, and everyday flannels.",
    image: "/photos/WhatsApp Image 2026-08-19 at 19.39.28.jpeg",
  },
  {
    name: "Formal & Office",
    description: "Crisp dress shirts, sharp collars, and wrinkle-resistant fabrics.",
    image: "/photos/WhatsApp Image 2026-08-19 at 19.39.47.jpeg",
  },
  {
    name: "Oversized & Streetwear",
    description: "Boxy fits, heavyweight cotton, and bold graphic statement pieces.",
    image: "/photos/WhatsApp Image 2026-08-19 at 19.40.04.jpeg",
  },
];



const featuredProducts = [
  {
    id: 1,
    name: "Classic Denim Overshirt",
    category: "Casual Wear",
    price: "$89",
    image: "/photos/WhatsApp Image 2026-08-19 at 19.39.25.jpeg",
  },
  {
    id: 2,
    name: "Premium Oxford Dress Shirt",
    category: "Formal & Office",
    price: "$99",
    image: "/photos/red-shirt-front.webp",
  },
  {
    id: 3,
    name: "Heavyweight Boxy Tee",
    category: "Oversized & Streetwear",
    price: "$45",
    image: "/photos/WhatsApp Image 2026-08-19 at 19.39.16.jpeg",
  },
  {
    id: 4,
    name: "Relaxed Linen Button-Down",
    category: "New Arrivals",
    price: "$79",
    image: "/photos/navy-blue3.jpg",
  },
];


export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              New Collection
            </p>

            <h1 className="max-w-xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
              Simple things.
              <br />
              Done beautifully.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
              Thoughtfully designed essentials made for everyday life.
              Discover our latest collection.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/customer"
                className="inline-flex h-12 items-center justify-center bg-primary px-7 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Shop collection
              </Link>

              <Link
                href="/customer#products"
                className="inline-flex h-12 items-center justify-center border border-border px-7 text-sm font-medium transition hover:bg-secondary"
              >
                Explore new arrivals
              </Link>
            </div>
          </div>

          <HeroCarousel />
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-medium tracking-tight">
                Shop by category
              </h2>
            </div>

            <Link
              href="/customer"
              className="hidden text-sm underline underline-offset-4 md:block"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="/customer#products"
                className="group bg-background p-8 transition hover:bg-secondary"
              >
                {/* Category Image */}
                <div className="relative mb-8 aspect-square overflow-hidden bg-secondary">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="text-lg font-medium">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {category.description}
                </p>

                <span className="mt-6 inline-block text-sm underline underline-offset-4">
                  Shop now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


{/* Featured Products */}
<section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
  <div className="mb-10 flex items-end justify-between">
    <div>
      <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
        Featured
      </p>

      <h2 className="mt-2 text-3xl font-medium tracking-tight">
        Selected for you
      </h2>
    </div>

    <Link
      href="/customer"
      className="text-sm underline underline-offset-4"
    >
      View all
    </Link>
  </div>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {featuredProducts.map((product) => (
      <Link
        key={product.id}
        href="/customer#products"
        className="group"
      >
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Product Details */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium">
              {product.name}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {product.category}
            </p>
          </div>

          <span className="text-sm font-medium">
            {product.price}
          </span>
        </div>
      </Link>
    ))}
  </div>
</section>


      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-28">
          <p className="text-sm uppercase tracking-[0.2em] opacity-70">
            Designed for everyday
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-medium tracking-tight md:text-5xl">
            Quality without unnecessary complexity.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-6 opacity-70 md:text-base">
            Discover pieces designed to last, made with attention to
            detail and built for everyday use.
          </p>

          <Link
            href="/customer"
            className="mt-8 inline-flex h-12 items-center bg-background px-8 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Start shopping
          </Link>
        </div>
      </section>

    </main>
  );
}
