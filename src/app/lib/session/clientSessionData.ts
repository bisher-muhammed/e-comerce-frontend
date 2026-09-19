export const CUSTOMER_STORAGE_PREFIX = "customer:";

const LEGACY_PREFIXES = ["checkout:draft:"];

const isCustomerKey = (key: string) =>
  key.startsWith(CUSTOMER_STORAGE_PREFIX) ||
  LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix));

export function clearClientSessionData(): void {
  if (typeof window === "undefined") return;

  for (const name of ["sessionStorage", "localStorage"] as const) {
    try {
      const storage = window[name];

      if (!storage) continue;

      const keys: string[] = [];

      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);

        if (key && isCustomerKey(key)) {
          keys.push(key);
        }
      }

      keys.forEach((key) => storage.removeItem(key));
    } catch {}
  }
}
