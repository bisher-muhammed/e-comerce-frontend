export const SESSION_HINT_COOKIE = "session";

export const ACCESS_TOKEN_COOKIE = "access_token";

export function readCookie(
  cookieHeader: string,
  name: string
): string | undefined {
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");

    if (separator === -1) continue;

    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return undefined;
}

export function hasSessionHint(
  cookieHeader: string = typeof document === "undefined"
    ? ""
    : document.cookie
): boolean {
  return Boolean(readCookie(cookieHeader, SESSION_HINT_COOKIE));
}

const PLACEHOLDER_ORIGIN = "http://storefront.invalid";

export function safeNextPath(
  raw: string | null | undefined
): string | null {
  if (!raw || raw.length > 2048) return null;

  if (!raw.startsWith("/") || raw.startsWith("//")) return null;

  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return null;

  let url: URL;

  try {
    url = new URL(raw, PLACEHOLDER_ORIGIN);
  } catch {
    return null;
  }

  if (url.origin !== PLACEHOLDER_ORIGIN) return null;

  if (url.pathname.startsWith("//") || url.pathname.startsWith("/\\")) {
    return null;
  }

  if (url.pathname === "/auth" || url.pathname.startsWith("/auth/")) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function loginPath(next?: string | null): string {
  const safe = safeNextPath(next);

  return safe
    ? `/auth/login?next=${encodeURIComponent(safe)}`
    : "/auth/login";
}
