"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, MapPin, LogOut, } from "lucide-react";

import { getCart } from "@/app/services/customer/cart.service";
import { getWishlist } from "@/app/services/customer/wishlist.service";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { useLogout } from "@/app/hooks/useLogout";
import { optionalAuthRequest } from "@/app/lib/api/apiPrivate";

export default function Navbar() {
  const { user } = useCurrentUser();
  const { logout, isLoggingOut } = useLogout();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        /*
         * Badge counts are decorative — a 401 here should blank the
         * badges, not throw the visitor out of the page they are on.
         */
        const [cartResponse, wishlistResponse] =
          await Promise.all([
            getCart(optionalAuthRequest),
            getWishlist(optionalAuthRequest),
          ]);

        if (cancelled) return;

        const cartItemCount =
          cartResponse.data.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

        const wishlistItemCount =
          wishlistResponse.data?.items.length ?? 0;

        setCartCount(cartItemCount);
        setWishlistCount(wishlistItemCount);
      } catch {
        // Navbar should not break if count requests fail.
      }
    };

    fetchCounts();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <header className="border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-wide"
        >
          STORE
        </Link>

        {/* Main Navigation */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/customer"
            className="text-gray-600 hover:text-black"
          >
            Shop
          </Link>

          <Link
            href="/coupon"
            className="text-gray-600 hover:text-black"
          >
            Offers
          </Link>

          {user && (
            <Link
              href="/accounts/orders"
              className="text-gray-600 hover:text-black"
            >
              Account
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-5">

          {user ? (
            <>
              {/* User greeting */}
              <span className="hidden text-sm text-gray-600 md:inline">
                Hi, {user.firstName}
              </span>

              {/* Address */}
              <Link
                href="/accounts/address"
                className="text-gray-600 transition-colors hover:text-black"
                aria-label="Addresses"
              >
                <MapPin size={20} />
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="hidden text-sm text-gray-600 md:inline"
            >
              Sign in
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/accounts/wishlist"
            className="relative"
            aria-label="Wishlist"
          >
            <Heart size={20} />

            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Sign out */}
          {user && (
            <button
              type="button"
              onClick={logout}
              disabled={isLoggingOut}
              aria-label="Sign out"
              title="Sign out"
              className="
                text-gray-600
                transition-colors
                hover:text-black
                disabled:pointer-events-none
                disabled:opacity-50
              "
            >
              <LogOut size={20} />
            </button>
          )}

        </div>
      </div>
    </header>
  );
}