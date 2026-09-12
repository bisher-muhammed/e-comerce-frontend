import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SITE_NAME } from "@/app/lib/seo/site";

export const metadata: Metadata = {
  title: { absolute: `Order Details · ${SITE_NAME}` },
  robots: { index: false, follow: false },
};

export default function OrderDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
