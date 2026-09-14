/**
 * Money and date formatters.
 * All amounts stored as minor units (paise). Divide by 100 for display.
 */

export function formatCurrency(
  amountMinor: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function minorToAmount(minor: number): number {
  return minor / 100;
}

export function amountToMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatMonthYear(month: number, year: number): string {
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function getMonthName(month: number): string {
  const d = new Date(2000, month - 1, 1);
  return new Intl.DateTimeFormat("en-IN", { month: "long" }).format(d);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
