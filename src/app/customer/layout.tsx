// app/(customer)/layout.tsx
import type { ReactNode } from "react";

import Navbar from "@/app/customer/components/layout/Navbar";
import Footer from "@/app/customer/components/layout/Footer";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
