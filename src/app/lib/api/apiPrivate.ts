import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { hasSessionHint, loginPath } from "@/app/lib/auth/session";
import { hardNavigate } from "@/app/lib/navigation";
import { clearClientSessionData } from "@/app/lib/session/clientSessionData";

import { API_URL, REQUEST_TIMEOUT_MS } from "./config";
import { SessionUnavailableError } from "./errors";

declare module "axios" {
  interface AxiosRequestConfig {
    /*
     * Background and optional calls (the session probe, badge counts,
     * guest-visible coupons) must fail quietly — a logged-out visitor
     * has to be able to browse the storefront.
     */
    skipAuthRedirect?: boolean;
  }
}

/*
 * Pass as (or spread into) the config of any request that is allowed
 * to 401 without ending the visitor's session.
 */
export const optionalAuthRequest: AxiosRequestConfig = {
  skipAuthRedirect: true,
};

const apiPrivate = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export type RefreshOutcome =
  | "refreshed"
  | "session-ended"
  | "unavailable";

let refreshInFlight: Promise<RefreshOutcome> | null = null;

export function refreshSession(): Promise<RefreshOutcome> {
  refreshInFlight ??= (async (): Promise<RefreshOutcome> => {
    try {
      await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      return "refreshed";
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      return status === 401 || status === 403
        ? "session-ended"
        : "unavailable";
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;

  const { pathname, search, hash } = window.location;

  if (pathname.startsWith("/auth/")) return;

  hardNavigate(loginPath(`${pathname}${search}${hash}`));
}

apiPrivate.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryRequestConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRedirect && !hasSessionHint()) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const outcome = await refreshSession();

    if (outcome === "refreshed") {
      return apiPrivate(originalRequest);
    }

    if (outcome === "session-ended") {
      clearClientSessionData();

      if (!originalRequest.skipAuthRedirect) {
        redirectToLogin();
      }

      return Promise.reject(error);
    }

    return Promise.reject(new SessionUnavailableError());
  }
);

export default apiPrivate;
