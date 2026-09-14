"use client";

import { useEffect, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = true,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fadeIn" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FEF2F2" }}>
              <AlertTriangle className="w-5 h-5" style={{ color: "#DC2626" }} aria-hidden="true" />
            </div>
          )}
          <div className="flex-1">
            <h2 id="confirm-title" className="text-base font-semibold" style={{ color: "#172033" }}>{title}</h2>
            <p className="mt-1.5 text-sm" style={{ color: "#64748B" }}>{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
            style={{ backgroundColor: isDestructive ? "#DC2626" : "#2563EB" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
