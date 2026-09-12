"use client";

import { Bell, Menu } from "lucide-react";

interface AdminNavbarProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

export default function AdminNavbar({
  onMenuClick,
  sidebarOpen = false,
}: AdminNavbarProps) {
  return (
    <header
      className="
        flex
        h-16
        w-full
        shrink-0
        items-center
        justify-between
        border-b
        border-border
        bg-background
        px-4
        sm:px-6
      "
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile / Tablet */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          aria-controls="admin-sidebar"
          aria-expanded={sidebarOpen}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            text-muted-foreground
            transition-colors
            hover:text-foreground
            xl:hidden
          "
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            Admin Dashboard
          </p>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage your store
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="
            relative
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          <Bell className="h-[18px] w-[18px]" />

          <span
            className="
              absolute
              right-1
              top-1
              h-1.5
              w-1.5
              rounded-full
              bg-destructive
            "
          />
        </button>

        {/* User */}
        <div
          className="
            hidden
            items-center
            gap-3
            border-l
            border-border
            pl-4
            sm:flex
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              bg-secondary
              text-xs
              font-medium
            "
          >
            SA
          </div>

          <div className="leading-tight">
            <p className="text-sm font-medium">
              Super Admin
            </p>

            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
