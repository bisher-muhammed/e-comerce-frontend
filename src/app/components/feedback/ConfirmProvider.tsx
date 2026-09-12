"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (
  options: ConfirmOptions
) => Promise<boolean>;

const ConfirmContext =
  createContext<ConfirmFn | null>(null);

/*
 * Promise-based replacement for window.confirm():
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "Delete this?" }))) return;
 */
export function useConfirm(): ConfirmFn {
  const context = useContext(
    ConfirmContext
  );

  if (!context) {
    throw new Error(
      "useConfirm must be used inside <ConfirmProvider>."
    );
  }

  return context;
}

export function ConfirmProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pending, setPending] =
    useState<ConfirmOptions | null>(null);

  const resolverRef = useRef<
    ((value: boolean) => void) | null
  >(null);

  const confirmButtonRef =
    useRef<HTMLButtonElement>(null);

  /*
   * Whatever had focus before the dialog opened, so it can be
   * handed back when the dialog closes.
   */
  const triggerRef =
    useRef<HTMLElement | null>(null);

  const settle = useCallback(
    (value: boolean) => {
      const resolve = resolverRef.current;

      resolverRef.current = null;

      setPending(null);

      triggerRef.current?.focus();
      triggerRef.current = null;

      resolve?.(value);
    },
    []
  );

  const confirm = useCallback<ConfirmFn>(
    (options) => {
      /*
       * A second confirm while one is open would strand the first
       * caller's promise forever — decline it instead.
       */
      resolverRef.current?.(false);

      triggerRef.current =
        document.activeElement instanceof
        HTMLElement
          ? document.activeElement
          : null;

      return new Promise<boolean>(
        (resolve) => {
          resolverRef.current = resolve;

          setPending(options);
        }
      );
    },
    []
  );

  useEffect(() => {
    if (!pending) return;

    confirmButtonRef.current?.focus();

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        settle(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [pending, settle]);

  /*
   * If the provider unmounts mid-dialog, release the caller.
   */
  useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  return (
    <ConfirmContext.Provider
      value={confirm}
    >
      {children}

      {pending && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-foreground/40
            px-4
          "
          onClick={() => settle(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={
              pending.description
                ? "confirm-dialog-description"
                : undefined
            }
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              w-full
              max-w-sm
              border
              border-border
              bg-card
              p-5
              shadow-lg
            "
          >
            <h2
              id="confirm-dialog-title"
              className="text-sm font-semibold"
            >
              {pending.title}
            </h2>

            {pending.description && (
              <p
                id="confirm-dialog-description"
                className="mt-2 text-sm text-muted-foreground"
              >
                {pending.description}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  settle(false)
                }
                className="
                  h-9
                  border
                  border-border
                  px-4
                  text-sm
                  transition-colors
                  hover:bg-secondary
                "
              >
                {pending.cancelLabel ??
                  "Cancel"}
              </button>

              <button
                type="button"
                ref={confirmButtonRef}
                onClick={() =>
                  settle(true)
                }
                className={`
                  h-9
                  px-4
                  text-sm
                  font-medium
                  transition-opacity
                  hover:opacity-90
                  ${
                    pending.destructive
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-primary text-primary-foreground"
                  }
                `}
              >
                {pending.confirmLabel ??
                  "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
