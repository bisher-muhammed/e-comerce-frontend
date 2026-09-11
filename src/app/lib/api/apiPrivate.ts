import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /*
     * Opt out of the "401 means the session is gone, send the browser
     * to /auth/login" behaviour below.
     *
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
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;

let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  failedQueue = [];
};

apiPrivate.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryRequestConfig;

    // Only handle 401 errors.
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    /*
     * Optional calls still attempt a refresh — a logged-in user with an
     * expired access token should stay logged in — but a failed refresh
     * leaves them where they are instead of bouncing them to login.
     */
    const redirectToLogin = () => {
      if (originalRequest?.skipAuthRedirect) return;

      window.location.href = "/auth/login";
    };

    // Don't refresh if the failed request itself is the refresh endpoint.
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      redirectToLogin();

      return Promise.reject(error);
    }

    // Prevent infinite retry loops.
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /*
     * Another request is already refreshing.
     * Wait for that refresh to finish.
     */
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then(() => {
        return apiPrivate(originalRequest);
      });
    }

    // This request becomes responsible for refreshing.
    isRefreshing = true;

    try {
      /*
       * Use normal axios here, not apiPrivate.
       *
       * The backend will verify the refresh_token cookie
       * and set a new access_token cookie.
       */
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );

      /*
       * The browser now has the new access_token cookie.
       */
      processQueue();

      // Retry the original request.
      return apiPrivate(originalRequest);
    } catch (refreshError) {
      /*
       * Refresh token is expired/invalid.
       * The session can no longer be recovered.
       */
      processQueue(refreshError);

      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiPrivate;
