"use client";

import { useState } from "react";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen w-full min-w-0 flex-col lg:ml-64 lg:w-[calc(100%-16rem)]">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}