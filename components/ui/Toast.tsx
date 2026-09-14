"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
  duration?: number;
}

const configs = {
  success: { icon: CheckCircle, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  error:   { icon: XCircle,     color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  warning: { icon: AlertCircle, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
};

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const cfg = configs[type];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm animate-fadeIn"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: cfg.color }} aria-hidden="true" />
      <p className="text-sm font-medium flex-1" style={{ color: "#172033" }}>{message}</p>
      <button onClick={onClose} className="flex-shrink-0" aria-label="Dismiss notification">
        <X className="w-4 h-4" style={{ color: "#64748B" }} />
      </button>
    </div>
  );
}
