"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

type ToastVariant =
  | "success"
  | "error"
  | "info";

interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: number) => void;
}

/*
 * Errors stay on screen longer than confirmations —
 * the user usually has to read and act on them.
 */
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

const ToastContext =
  createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside <ToastProvider>."
    );
  }

  return context;
}

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<
    Toast[]
  >([]);

  const idRef = useRef(0);

  const timersRef = useRef(
    new Map<
      number,
      ReturnType<typeof setTimeout>
    >()
  );

  const dismiss = useCallback(
    (id: number) => {
      const timer =
        timersRef.current.get(id);

      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }

      setToasts((current) =>
        current.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  const push = useCallback(
    (
      variant: ToastVariant,
      message: string
    ) => {
      idRef.current += 1;

      const id = idRef.current;

      setToasts((current) => [
        ...current,
        { id, variant, message },
      ]);

      timersRef.current.set(
        id,
        setTimeout(
          () => dismiss(id),
          variant === "error"
            ? ERROR_DURATION
            : DEFAULT_DURATION
        )
      );
    },
    [dismiss]
  );

  /*
   * Drop any pending timers if the provider itself unmounts.
   */
  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) =>
        push("success", message),
      error: (message) =>
        push("error", message),
      info: (message) =>
        push("info", message),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-label="Notifications"
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-[300]
          flex
          flex-col
          items-center
          gap-2
          px-4
          py-4
          sm:items-end
          sm:px-6
        "
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const Icon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      /*
       * role="alert" is implicitly assertive, so errors interrupt.
       * Confirmations wait their turn with role="status".
       */
      role={
        toast.variant === "error"
          ? "alert"
          : "status"
      }
      className={`
        toast-enter
        pointer-events-auto
        flex
        w-full
        max-w-sm
        items-start
        gap-3
        border
        bg-card
        px-4
        py-3
        shadow-sm
        ${
          toast.variant === "error"
            ? "border-destructive/40"
            : "border-border"
        }
      `}
    >
      <Icon
        aria-hidden="true"
        className={`
          mt-0.5
          h-4
          w-4
          shrink-0
          ${
            toast.variant === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }
        `}
      />

      <p
        className={`
          flex-1
          text-sm
          ${
            toast.variant === "error"
              ? "text-destructive"
              : "text-foreground"
          }
        `}
      >
        {toast.message}
      </p>

      <button
        type="button"
        onClick={() =>
          onDismiss(toast.id)
        }
        aria-label="Dismiss notification"
        className="
          -mr-1
          -mt-1
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          text-muted-foreground
          transition-colors
          hover:text-foreground
        "
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
