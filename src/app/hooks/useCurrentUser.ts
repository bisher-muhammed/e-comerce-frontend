
"use client";

import { useCallback, useEffect, useState } from "react";

import apiPrivate, {
  optionalAuthRequest,
} from "@/app/lib/api/apiPrivate";
import { getApiErrorStatus } from "@/app/lib/api/apiError";
import type { UserRole } from "@/app/lib/auth/roles";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  role: UserRole;
}

export type SessionStatus =
  | "loading"
  | "authenticated"
  | "guest"
  | "unavailable";

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await apiPrivate.get(
    "/auth/me",
    optionalAuthRequest
  );

  return response.data.data.user;
}

export function classifySessionError(
  error: unknown
): "guest" | "unavailable" {
  const status = getApiErrorStatus(error);

  return status === 401 || status === 403 ? "guest" : "unavailable";
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const current = await fetchCurrentUser();

        if (cancelled) return;

        setUser(current);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) return;

        setUser(null);
        setStatus(classifySessionError(error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  return {
    user,
    status,
    isLoading: status === "loading",
    reload,
  };
}
