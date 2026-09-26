import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  SESSION_HINT_COOKIE,
  loginPath,
} from "@/app/lib/auth/session";

export function proxy(request: NextRequest) {
  const signedIn =
    Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value) ||
    Boolean(request.cookies.get(SESSION_HINT_COOKIE)?.value);

  if (signedIn) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  return NextResponse.redirect(
    new URL(loginPath(`${pathname}${search}`), request.url)
  );
}

export const config = {
  matcher: ["/accounts/:path*", "/checkout", "/cart"],
};
