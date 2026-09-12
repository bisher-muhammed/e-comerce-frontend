"use client";

import Link from "next/link";
import { Heart, ShoppingBag, MapPin, LogOut, } from "lucide-react";

import { useLogout } from "@/app/hooks/useLogout";
import { useStoreData } from "@/app/components/store/StoreDataProvider";

export default function Navbar() {
  const { user, cartCount, wishlistCount } = useStoreData();
  const { logout, isLoggingOut } = useLogout();

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
            aria-label={
              wishlistCount > 0
                ? `Wishlist, ${wishlistCount} ${
                    wishlistCount === 1 ? "item" : "items"
                  }`
                : "Wishlist"
            }
          >
            <Heart size={20} aria-hidden="true" />

            {wishlistCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white"
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative"
            aria-label={
              cartCount > 0
                ? `Cart, ${cartCount} ${
                    cartCount === 1 ? "item" : "items"
                  }`
                : "Cart"
            }
          >
            <ShoppingBag size={20} aria-hidden="true" />

            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white"
              >
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