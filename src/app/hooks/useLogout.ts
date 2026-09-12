"use client";

import { useState } from "react";
import apiPrivate, {
  optionalAuthRequest,
} from "@/app/lib/api/apiPrivate";
import { useToast } from "@/app/components/feedback/ToastProvider";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toast = useToast();

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

      toast.error(
        "Unable to log out. Please try again."
      );
    }
  };

  return { logout, isLoggingOut };
}
