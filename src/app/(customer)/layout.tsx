import type { ReactNode } from "react";
import Navbar from "@/app/(customer)/customer/components/layout/Navbar";
import Footer from "@/app/(customer)/customer/components/layout/Footer";
import { StoreDataProvider } from "@/app/components/store/StoreDataProvider";


export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <StoreDataProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </StoreDataProvider>
  );
}
