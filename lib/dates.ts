/**
 * Date utilities using user timezone (default: Asia/Kolkata).
 */

export function getMonthBoundaries(
  month: number,
  year: number,
  timezone: string = "Asia/Kolkata"
): { start: Date; end: Date } {
  // Start of month in UTC
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  // End of month — first moment of next month
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { start, end };
}

export function parseMonthYear(
  month: string | number,
  year: string | number
): { month: number; year: number } {
  const m = Number(month);
  const y = Number(year);
  if (m < 1 || m > 12 || y < 2000 || y > 2100 || isNaN(m) || isNaN(y)) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }
  return { month: m, year: y };
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getPreviousMonth(month: number, year: number) {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

export function getLast6Months(): { month: number; year: number }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return result;
}
