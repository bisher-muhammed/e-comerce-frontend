export type OrderDateFilter =
    | {
          ok: true;
          startDate?: string;
          endDate?: string;
      }
    | { ok: false; error: string };

export function buildOrderDateFilter(
    startDate: string,
    endDate: string
): OrderDateFilter {
    const start = startDate.trim() || undefined;
    const end = endDate.trim() || undefined;

    if (start && end && start > end) {
        return {
            ok: false,
            error: "Start date must be on or before end date.",
        };
    }

    return { ok: true, startDate: start, endDate: end };
}
