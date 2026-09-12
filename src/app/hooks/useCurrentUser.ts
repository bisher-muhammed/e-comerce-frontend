
"use client";

import { useEffect, useState } from "react";
import apiPrivate, {
  optionalAuthRequest,
} from "@/app/lib/api/apiPrivate";
import type { UserRole } from "@/app/lib/auth/roles";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  role: UserRole;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        /*
         * This is a probe, not an assertion of access — a guest
         * must get `user = null`, not a redirect to login.
         */
        const response = await apiPrivate.get(
          "/auth/me",
          optionalAuthRequest
        );

        if (!cancelled) setUser(response.data.data.user);
      } catch {
        // 401 or network error — either way, no authenticated user.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading };
}