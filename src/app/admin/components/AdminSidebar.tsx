"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
  UserCog,
  LogOut,
  X,
} from "lucide-react";

import { useLogout } from "@/app/hooks/useLogout";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "CouponMabagement",
    href: "/admin/coupon",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },

   {
    label: "customers",
    href: "/admin/customer",
    icon: Package,
  },
  
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  
  {
    label: "Sizes",
    href: "/admin/sizes",
    icon: Users,
  },

  {
    label: "Colors",
    href: "/admin/colors",
    icon: Users,
  },
];

const management = [
  {
    label: "Admins",
    href: "/admin/admins",
    icon: UserCog,
  },
];

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-[100dvh]
          w-64
          border-r
          border-border
          bg-background
          lg:block

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }

          transition-transform
          duration-200
          ease-in-out
        `}
      >
        <div className="flex h-full flex-col overflow-hidden">

          {/* ================= HEADER ================= */}

          <div
            className="
              flex
              h-16
              shrink-0
              items-center
              justify-between
              border-b
              border-border
              px-5
            "
          >
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="
                text-lg
                font-semibold
                tracking-tight
              "
            >
              STORE.
            </Link>

            <div className="flex items-center gap-1">

              {/* Logout - Small screens */}
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                aria-label="Log out"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-sm
                  text-muted-foreground
                  hover:bg-secondary
                  hover:text-foreground
                  disabled:pointer-events-none
                  disabled:opacity-50
                  lg:hidden
                "
              >
                <LogOut className="h-5 w-5" />
              </button>

              {/* Close - Small screens */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sidebar"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-sm
                  text-muted-foreground
                  hover:bg-secondary
                  hover:text-foreground
                  lg:hidden
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>
          </div>

          {/* ================= NAVIGATION ================= */}

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">

            {/* Overview */}

            <p
              className="
                mb-2
                px-3
                text-[11px]
                font-medium
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Overview
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex
                      h-10
                      w-full
                      items-center
                      gap-3
                      rounded-sm
                      px-3
                      text-sm
                      transition-colors

                      ${
                        active
                          ? "bg-secondary font-medium text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0" />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Management */}

            <p
              className="
                mb-2
                mt-8
                px-3
                text-[11px]
                font-medium
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Management
            </p>

            <nav className="space-y-1">
              {management.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex
                      h-10
                      w-full
                      items-center
                      gap-3
                      rounded-sm
                      px-3
                      text-sm
                      transition-colors

                      ${
                        active
                          ? "bg-secondary font-medium text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0" />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ================= LOGOUT - DESKTOP ================= */}

          <div
            className="
              hidden
              shrink-0
              border-t
              border-border
              bg-background
              p-3
              lg:block
            "
          >
            <button
              type="button"
              onClick={logout}
              disabled={isLoggingOut}
              className="
                flex
                h-10
                w-full
                items-center
                gap-3
                rounded-sm
                px-3
                text-sm
                text-muted-foreground
                transition-colors
                hover:bg-secondary
                hover:text-foreground
                disabled:pointer-events-none
                disabled:opacity-50
              "
            >
              <LogOut className="h-[17px] w-[17px] shrink-0" />

              <span>
                {isLoggingOut ? "Logging out…" : "Log out"}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
