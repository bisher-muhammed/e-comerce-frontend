import type { NextConfig } from "next";
import {
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} from "next/constants";

import { buildSecurityHeaders } from "./security-headers";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

function assertConfiguration(phase: string) {
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set for production builds (see .env.example)."
    );
  }

  if (
    (phase === PHASE_PRODUCTION_BUILD ||
      phase === PHASE_PRODUCTION_SERVER) &&
    !cloudinaryCloudName
  ) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME must be set when building and when running `next start` (see .env.example)."
    );
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error"] }
        : false,
  },

  images: {
    remotePatterns: [
      ...(cloudinaryCloudName
        ? [
            {
              protocol: "https" as const,
              hostname: "res.cloudinary.com",
              pathname: `/${cloudinaryCloudName}/**`,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
          isDevelopment: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
};

export default function config(phase: string): NextConfig {
  assertConfiguration(phase);

  if (!cloudinaryCloudName && process.env.NODE_ENV === "development") {
    console.warn(
      "[next.config] CLOUDINARY_CLOUD_NAME is not set: product images will not load through next/image."
    );
  }

  return nextConfig;
}
