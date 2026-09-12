import type {
  FieldValues,
  Path,
  UseFormSetError,
} from "react-hook-form";

import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "./apiError";

/*
 * Turn an API failure into inline form errors.
 *
 * Validation failures carry a field name, so they land under the input
 * that caused them. Anything else (bad credentials, conflicts, network
 * trouble) has no field to attach to and becomes a form-level `root`
 * error instead — react-hook-form clears both on the next submit.
 */
export function applyServerErrors<
  TFieldValues extends FieldValues,
>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fields: readonly Path<TFieldValues>[],
  fallback: string
): void {
  const fieldErrors = getApiFieldErrors(
    error
  ).filter((item) =>
    (fields as readonly string[]).includes(
      item.field
    )
  );

  if (fieldErrors.length === 0) {
    setError("root", {
      message: getApiErrorMessage(
        error,
        fallback
      ),
    });

    return;
  }

  fieldErrors.forEach(
    ({ field, message }) =>
      setError(
        field as Path<TFieldValues>,
        { message }
      )
  );
}
