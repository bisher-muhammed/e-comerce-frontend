"use client";

import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card p-6 shadow-lg"
      >
        <div
          className={`mb-4 flex h-10 w-10 items-center justify-center ${
            destructive ? "bg-destructive/10" : "bg-accent"
          }`}
        >
          <AlertCircle
            className={`h-5 w-5 ${
              destructive
                ? "text-destructive"
                : "text-foreground"
            }`}
          />
        </div>

        <h2
          id="confirm-dialog-title"
          className="text-lg font-medium"
        >
          {title}
        </h2>

        <div className="mt-2 text-sm text-muted-foreground">
          {description}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`h-11 flex-1 text-sm font-medium disabled:opacity-50 ${
              destructive
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="h-11 flex-1 border border-border bg-card text-sm font-medium text-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
