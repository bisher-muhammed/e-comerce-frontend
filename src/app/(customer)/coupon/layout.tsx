import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Offers & Coupons",
  description: "Current discount codes and offers you can use at checkout.",
  alternates: { canonical: "/coupon" },
};

export default function CouponLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
