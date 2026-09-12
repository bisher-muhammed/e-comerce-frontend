"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Addresses", href: "/accounts/address" },
  { label: "Orders", href: "/accounts/orders" },
  { label: "Wishlist", href: "/accounts/wishlist" },
];

export default function AccountLayout({
  children,
}: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  /*
   * The account area is the one part of the storefront that genuinely
   * requires a session. The API interceptor no longer redirects on the
   * session probe — guests have to be able to browse — so the guard
   * lives here, at the route boundary.
   */
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-wider text-muted-foreground">
            YOUR ACCOUNT
          </p>

          <h1 className="mt-1 text-3xl font-medium text-foreground">
            {user.firstName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">
          <aside className="flex flex-col justify-between">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "border-l-2 border-foreground py-1.5 pl-3 text-sm font-medium text-foreground"
                        : "border-l-2 border-transparent py-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/customer"
              className="mt-10 hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
            >
              <ChevronLeft size={14} />
              Back to shop
            </Link>
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
