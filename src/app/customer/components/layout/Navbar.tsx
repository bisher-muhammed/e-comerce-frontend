// app/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { getCart } from "@/app/services/customer/cart.service";
// Swap for your real auth hook/context. This is a placeholder shape —
// I have no visibility into how you're managing auth in this app.
import { useCurrentUser } from "@/app/hooks/useCurrentUser";


export default function Navbar() {
  const { user } = useCurrentUser();
  const [cartCount, setCartCount] = useState(0);

  console.log("Userrrrr",user)

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await getCart();
        if (cancelled) return;

        const count = response.data.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(count);
      } catch {
        // Silent fail on purpose: a broken cart-count fetch shouldn't
        // block rendering the whole nav. Worth logging to your error
        // tracker (Sentry etc.) rather than swallowing entirely.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <header className="border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          STORE
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/shop" className="text-gray-600 hover:text-black">
            Shop
          </Link>
          <Link href="/collections" className="text-gray-600 hover:text-black">
            Collections
          </Link>
          <Link href="/account" className="text-gray-600 hover:text-black">
            Account
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          {user ? (
            <span className="hidden text-sm text-gray-600 md:inline">
              Hi, {user?.firstName}
            </span>
          ) : (
            <Link href="/auth/login" className="hidden text-sm text-gray-600 md:inline">
              Sign in
            </Link>
          )}

          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
