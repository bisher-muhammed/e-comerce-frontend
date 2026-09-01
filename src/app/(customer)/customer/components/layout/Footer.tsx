// app/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-gray-500 md:flex-row">
        <p>© {new Date().getFullYear()} STORE. All rights reserved.</p>

        <nav className="flex gap-6">
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <Link href="/about" className="hover:text-black">
            About
          </Link>
          <Link href="/account" className="hover:text-black">
            Account
          </Link>
        </nav>
      </div>
    </footer>
  );
}
