"use client";

/**
 * AmountDisplay – reusable masked currency component.
 *
 * When `hidden` is true, renders a fixed mask (•••••) that does not
 * reveal the number of digits or the magnitude of the amount.
 * The prefix (+/-) is always shown so sign context is preserved.
 *
 * When `hidden` is false, renders the formatted currency using the
 * existing shared formatCurrency helper.
 *
 * Do NOT pass pre-formatted strings as `amountMinor` — always pass
 * the raw integer value in minor units (paise) and let this component
 * do the formatting.
 */

import { formatCurrency } from "@/lib/formatters";

const MASK = "•••••";

interface AmountDisplayProps {
  /** Amount in minor units (paise). Always pass the raw number, never a formatted string. */
  amountMinor: number;
  /** When true, renders the mask instead of the real value. */
  hidden?: boolean;
  /** ISO 4217 currency code. Defaults to INR. */
  currency?: string;
  /** Optional prefix like "+" or "-". Shown even when hidden. */
  prefix?: string;
  /** Optional CSS class name. */
  className?: string;
}

export default function AmountDisplay({
  amountMinor,
  hidden = false,
  currency = "INR",
  prefix,
  className,
}: AmountDisplayProps) {
  if (hidden) {
    return (
      <span className={className} aria-label="Amount hidden">
        {prefix ? `${prefix}${MASK}` : MASK}
      </span>
    );
  }

  return (
    <span className={className}>
      {prefix}
      {formatCurrency(amountMinor, currency)}
    </span>
  );
}
