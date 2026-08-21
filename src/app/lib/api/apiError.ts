import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      fallback
    );
  }

  return fallback;
};

