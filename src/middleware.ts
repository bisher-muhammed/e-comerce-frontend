import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/accounts/:path*",
    "/checkout",
    "/cart",
  ],
};
