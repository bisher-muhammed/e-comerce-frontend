export const SITE_NAME = "STORE";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://raviscort.com";

export const SITE_DESCRIPTION =
  "Shirts, streetwear and everyday essentials — new arrivals, casual and formal wear, delivered across India.";

export const toMetaDescription = (
  value: string | null | undefined,
  fallback: string
): string => {
  const text = value?.replace(/\s+/g, " ").trim();

  if (!text) {
    return fallback;
  }

  if (text.length <= 155) {
    return text;
  }

  return `${text.slice(0, 152).trimEnd()}…`;
};
