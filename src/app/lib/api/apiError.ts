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
