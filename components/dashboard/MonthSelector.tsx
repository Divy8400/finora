"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthName } from "@/lib/formatters";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export default function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const goPrev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const goNext = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Month selector">
      <button
        onClick={goPrev}
        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
        style={{ borderColor: "#E2E8F0", color: "#64748B" }}
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="min-w-[140px] text-center">
        <span className="text-sm font-semibold" style={{ color: "#172033" }}>
          {getMonthName(month)} {year}
        </span>
      </div>

      <button
        onClick={goNext}
        disabled={isCurrentMonth()}
        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: "#E2E8F0", color: "#64748B" }}
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
