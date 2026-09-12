import type { Metadata } from "next";

import AdminShell from "./components/AdminShell";

export const metadata: Metadata = {
  title: { absolute: "Store Admin" },
  description: "Store administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
