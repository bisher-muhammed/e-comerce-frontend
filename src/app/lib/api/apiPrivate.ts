import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

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

    // Don't refresh if the failed request itself is the refresh endpoint.
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      window.location.href = "/auth/login";

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

      window.location.href = "/auth/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiPrivate;
