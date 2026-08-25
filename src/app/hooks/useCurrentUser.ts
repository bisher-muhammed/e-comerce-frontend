
"use client";

import { useEffect, useState } from "react";
import apiPrivate from "@/app/lib/api/apiPrivate";

interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await apiPrivate.get("/auth/me");
        console.log("Response",response.data)
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