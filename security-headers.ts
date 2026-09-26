const RAZORPAY_SCRIPT = "https://checkout.razorpay.com";
const RAZORPAY_ORIGINS = "https://*.razorpay.com";

export interface SecurityHeaderOptions {
  apiUrl?: string;
  isDevelopment?: boolean;
}

const originOf = (url: string | undefined): string | null => {
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export function buildContentSecurityPolicy({
  apiUrl,
  isDevelopment = false,
}: SecurityHeaderOptions): string {
  const apiOrigin = originOf(apiUrl);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      RAZORPAY_SCRIPT,
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", RAZORPAY_ORIGINS],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      ...(apiOrigin ? [apiOrigin] : []),
      RAZORPAY_ORIGINS,
      ...(isDevelopment ? ["ws:", "wss:"] : []),
    ],
    "frame-src": [RAZORPAY_ORIGINS],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'", RAZORPAY_ORIGINS],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  const policy = Object.entries(directives).map(
    ([name, values]) => `${name} ${values.join(" ")}`
  );

  if (!isDevelopment) {
    policy.push("upgrade-insecure-requests");
  }

  return policy.join("; ");
}

export function buildSecurityHeaders(
  options: SecurityHeaderOptions
): { key: string; value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    ...(options.isDevelopment
      ? []
      : [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
        ]),
    {
      key: "Permissions-Policy",
      value:
        'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")',
    },
  ];
}
