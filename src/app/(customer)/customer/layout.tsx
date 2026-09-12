import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse the full catalogue — new arrivals, casual wear, formal shirts and oversized streetwear.",
  alternates: { canonical: "/customer" },
};

export default function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
