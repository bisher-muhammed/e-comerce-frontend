import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  // Detailed validation errors
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((error: { message?: string }) => error.message)
      .filter(Boolean)
      .join(", ");
  }

  // Normal API error
  if (typeof data?.message === "string") {
    return data.message;
  }

  return fallback;
};
