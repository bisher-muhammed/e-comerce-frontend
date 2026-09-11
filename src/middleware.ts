import { NextResponse, type NextRequest } from "next/server";
import { isAdminRole, type UserRole } from "@/app/lib/auth/roles";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const ADMIN_PREFIX = "/admin";

const decodeRole = (
  token: string | undefined
): UserRole | null => {
  const payload = token?.split(".")[1];

  if (!payload) return null;

  try {
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const role = JSON.parse(atob(padded))?.role;

    return role === "CUSTOMER" ||
      role === "ADMIN" ||
      role === "SUPER_ADMIN"
      ? role
      : null;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(
    ACCESS_TOKEN_COOKIE
  )?.value;

  const refreshToken = request.cookies.get(
    REFRESH_TOKEN_COOKIE
  )?.value;

  const signedIn = Boolean(accessToken || refreshToken);

  if (!signedIn) {
    return NextResponse.redirect(
      new URL("/auth/login", request.url)
    );
  }

  const isAdminRoute =
    request.nextUrl.pathname.startsWith(ADMIN_PREFIX);

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const role =
    decodeRole(accessToken) ?? decodeRole(refreshToken);

  if (!isAdminRole(role)) {
    return NextResponse.redirect(
      new URL("/customer", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/accounts/:path*",
    "/checkout",
    "/cart",
  ],
};
