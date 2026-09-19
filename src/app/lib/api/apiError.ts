import axios from "axios";
import { ZodError } from "zod";

import { UserFacingError } from "./errors";

export const TIMEOUT_MESSAGE =
  "The server took too long to respond. Please try again.";

export const NETWORK_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (error instanceof UserFacingError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
      ? TIMEOUT_MESSAGE
      : NETWORK_MESSAGE;
  }

  const data = error.response.data;

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

export const getApiErrorStatus = (
  error: unknown
): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

export const getApiErrorCode = (
  error: unknown
): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined;

  const code = (error.response?.data as { code?: unknown } | undefined)
    ?.code;

  return typeof code === "string" ? code : undefined;
};

export interface ApiFieldError {
  field: string;
  message: string;
}

/*
 * The API reports validation failures as
 *   { errors: [{ field: "body.email", message: "..." }] }
 *
 * Strip the body./params./query. prefix so the field name lines up
 * with the form field it came from.
 */
export const getApiFieldErrors = (
  error: unknown
): ApiFieldError[] => {
  if (!axios.isAxiosError(error)) {
    return [];
  }

  const data = error.response?.data;

  if (!Array.isArray(data?.errors)) {
    return [];
  }

  return data.errors.flatMap(
    (item: {
      field?: unknown;
      message?: unknown;
    }) =>
      typeof item?.field === "string" &&
      typeof item?.message === "string"
        ? [
            {
              field: item.field.replace(
                /^(body|params|query)\./,
                ""
              ),
              message: item.message,
            },
          ]
        : []
  );
};
