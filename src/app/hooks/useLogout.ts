"use client";

import { useState } from "react";
import apiPrivate, {
  optionalAuthRequest,
} from "@/app/lib/api/apiPrivate";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await apiPrivate.post(
        "/auth/logout",
        {},
        optionalAuthRequest
      );

      window.location.href = "/auth/login";
    } catch {

      setIsLoggingOut(false);

      alert("Unable to log out. Please try again.");
    }
  };

  return { logout, isLoggingOut };
}
