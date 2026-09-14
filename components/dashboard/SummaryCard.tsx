"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import AmountDisplay from "@/components/ui/AmountDisplay";

interface SummaryCardProps {
  title: string;
  amountMinor: number;
  type: "income" | "expense" | "balance" | "savings";
  currency?: string;
  subtitle?: string;
  /** When true, masks the amount with •••••. */
  hidden?: boolean;
}

const configs = {
  income: {
    icon: TrendingUp,
    color: "#16A34A",
    bg: "#F0FDF4",
  },
  expense: {
    icon: TrendingDown,
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  balance: {
    icon: Wallet,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  savings: {
    icon: PiggyBank,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
};

export default function SummaryCard({
  title,
  amountMinor,
  type,
  currency = "INR",
  subtitle,
  hidden = false,
}: SummaryCardProps) {
  const cfg = configs[type];
  const Icon = cfg.icon;
  const isNegative = amountMinor < 0;

  return (
    <div
      className="bg-white rounded-xl border p-5 flex items-start gap-4 shadow-sm"
      style={{ borderColor: "#E2E8F0" }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: cfg.bg }}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "#64748B" }}>
          {title}
        </p>
        <p
          className="text-xl font-bold mt-0.5 truncate"
          style={{ color: hidden ? "#172033" : isNegative ? "#DC2626" : "#172033" }}
        >
          <AmountDisplay
            amountMinor={Math.abs(amountMinor)}
            hidden={hidden}
            currency={currency}
            prefix={hidden ? undefined : isNegative ? "-" : undefined}
            aria-label={`${title}: ${hidden ? "amount hidden" : undefined}`}
          />
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
