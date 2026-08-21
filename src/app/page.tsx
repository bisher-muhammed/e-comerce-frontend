import Link from "next/link";

const categories = [
  {
    name: "New Arrivals",
    description: "Fresh styles just added",
  },
  {
    name: "Men",
    description: "Everyday essentials",
  },
  {
    name: "Women",
    description: "Modern styles",
  },
  {
    name: "Accessories",
    description: "Complete your look",
  },
];

const featuredProducts = [
  {
    id: 1,
    name: "Minimal Leather Sneaker",
    category: "Footwear",
    price: "$129",
  },
  {
    id: 2,
    name: "Classic Overshirt",
    category: "Men",
    price: "$89",
  },
  {
    id: 3,
    name: "Everyday Tote",
    category: "Accessories",
    price: "$69",
  },
  {
    id: 4,
    name: "Relaxed Cotton Shirt",
    category: "Women",
    price: "$79",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            STORE.
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/products"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Shop
            </Link>

            <Link
              href="/products?category=new"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              New Arrivals
            </Link>

            <Link
              href="/products?category=men"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Men
            </Link>

            <Link
              href="/products?category=women"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Women
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="hidden text-sm md:block"
            >
              Login
            </Link>

            <Link
              href="/cart"
              className="text-sm"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

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
                href="/products"
                className="inline-flex h-12 items-center justify-center bg-primary px-7 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Shop collection
              </Link>

              <Link
                href="/products?category=new"
                className="inline-flex h-12 items-center justify-center border border-border px-7 text-sm font-medium transition hover:bg-secondary"
              >
                Explore new arrivals
              </Link>
            </div>
          </div>

          {/* Hero visual placeholder */}
          <div className="aspect-4/5 bg-secondary">
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Hero Image
              </span>
            </div>
          </div>
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
              href="/products"
              className="hidden text-sm underline underline-offset-4 md:block"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className="group bg-background p-8 transition hover:bg-secondary"
              >
                <div className="mb-16 aspect-square bg-secondary" />

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
            href="/products"
            className="text-sm underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="aspect-4/5 bg-secondary transition-opacity group-hover:opacity-80">
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    Product Image
                  </span>
                </div>
              </div>

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
            href="/products"
            className="mt-8 inline-flex h-12 items-center bg-background px-8 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Start shopping
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 STORE. All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="/products">Shop</Link>
            <Link href="/profile">Account</Link>
            <Link href="/cart">Cart</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
