/**
 * Financial calculation functions.
 * All amounts are in minor units (paise). Use integers only — no floats.
 */

export function calcMonthlyIncome(
  transactions: { type: string; amountMinor: number; deletedAt: Date | null }[]
): number {
  return transactions
    .filter((t) => t.type === "income" && t.deletedAt === null)
    .reduce((sum, t) => sum + t.amountMinor, 0);
}

export function calcMonthlyExpenses(
  transactions: { type: string; amountMinor: number; deletedAt: Date | null }[]
): number {
  return transactions
    .filter((t) => t.type === "expense" && t.deletedAt === null)
    .reduce((sum, t) => sum + t.amountMinor, 0);
}

export function calcBalance(incomeMinor: number, expensesMinor: number): number {
  return incomeMinor - expensesMinor;
}

export function calcSavingsRate(
  incomeMinor: number,
  expensesMinor: number
): number | null {
  if (incomeMinor <= 0) return null;
  const rate = ((incomeMinor - expensesMinor) / incomeMinor) * 100;
  return Math.round(rate * 100) / 100;
}

export function calcBudgetUsagePercent(
  usedMinor: number,
  limitMinor: number
): number | null {
  if (limitMinor <= 0) return null;
  const pct = (usedMinor / limitMinor) * 100;
  return Math.round(pct * 100) / 100;
}

export type BudgetStatus = "healthy" | "warning" | "danger" | "exceeded" | "not-set";

export function getBudgetStatus(usagePercent: number | null): BudgetStatus {
  if (usagePercent === null) return "not-set";
  if (usagePercent > 100) return "exceeded";
  if (usagePercent > 90) return "danger";
  if (usagePercent >= 70) return "warning";
  return "healthy";
}

export function calcGoalProgress(
  savedAmountMinor: number,
  targetAmountMinor: number
): number {
  if (targetAmountMinor <= 0) return 0;
  const pct = (savedAmountMinor / targetAmountMinor) * 100;
  return Math.min(Math.round(pct * 100) / 100, 100);
}

export function calcGoalProgressUncapped(
  savedAmountMinor: number,
  targetAmountMinor: number
): number {
  if (targetAmountMinor <= 0) return 0;
  const pct = (savedAmountMinor / targetAmountMinor) * 100;
  return Math.round(pct * 100) / 100;
}
