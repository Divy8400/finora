"use client";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  height?: number;
  label?: string;
}

export default function ProgressBar({ value, max = 100, color = "#2563EB", height = 8, label }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, backgroundColor: "#E2E8F0" }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
