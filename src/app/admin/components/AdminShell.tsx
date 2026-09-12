"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { isAdminRole } from "@/app/lib/auth/roles";

export default function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const allowed = isAdminRole(user?.role);

  useEffect(() => {
    if (isLoading || allowed) return;

    router.replace(user ? "/customer" : "/auth/login");
  }, [isLoading, allowed, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Checking access…
        </p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

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
