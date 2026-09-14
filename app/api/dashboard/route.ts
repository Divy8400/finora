import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized } from "@/lib/authorization";
import { parseMonthYear, getMonthBoundaries } from "@/lib/dates";
import {
  calcMonthlyIncome,
  calcMonthlyExpenses,
  calcBalance,
  calcSavingsRate,
  calcBudgetUsagePercent,
  getBudgetStatus,
} from "@/lib/calculations";
import { toSafeTransaction } from "@/lib/safe-transaction";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const { month, year } = parseMonthYear(
    searchParams.get("month") || new Date().getMonth() + 1,
    searchParams.get("year") || new Date().getFullYear()
  );

  const { start, end } = getMonthBoundaries(month, year);

  const [transactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, deletedAt: null, transactionDate: { gte: start, lt: end } },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { transactionDate: "desc" },
    }),
    prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: { select: { id: true, name: true, color: true } } },
    }),
  ]);

  const totalIncome = calcMonthlyIncome(transactions);
  const totalExpenses = calcMonthlyExpenses(transactions);
  const balance = calcBalance(totalIncome, totalExpenses);
  const savingsRate = calcSavingsRate(totalIncome, totalExpenses);

  // Category spending — only name + color + total amount (no internal fields)
  const categorySpending: Record<string, { name: string; color: string | null; amountMinor: number }> = {};
  for (const t of transactions) {
    if (t.type === "expense") {
      if (!categorySpending[t.categoryId]) {
        categorySpending[t.categoryId] = {
          name: t.category.name,
          color: t.category.color ?? null,
          amountMinor: 0,
        };
      }
      categorySpending[t.categoryId].amountMinor += t.amountMinor;
    }
  }

  // Budget progress — safe shape (no userId, createdAt, etc.)
  const budgetProgress = budgets.map((b) => {
    const used = categorySpending[b.categoryId]?.amountMinor || 0;
    const usagePercent = calcBudgetUsagePercent(used, b.limitAmountMinor);
    const status = getBudgetStatus(usagePercent);
    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      limitAmountMinor: b.limitAmountMinor,
      usedAmountMinor: used,
      remainingAmountMinor: b.limitAmountMinor - used,
      usagePercent,
      status,
    };
  });

  // Recent transactions — use safe mapper to strip internal fields
  const recentTransactions = transactions.slice(0, 5).map(toSafeTransaction);

  return NextResponse.json({
    month,
    year,
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    categorySpending: Object.entries(categorySpending).map(([id, data]) => ({
      categoryId: id,
      name: data.name,
      amountMinor: data.amountMinor,
    })),
    budgetProgress,
    recentTransactions,
  });
}
